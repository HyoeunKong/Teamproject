'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  async Init(stub) {
    console.info('=========== Instantiated Medical Report chaincode ===========');
    return shim.success();
  }


  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }


    async testLedger(stub) {
        console.info('============= START : test insert Ledger ===========');
        const mr = 
            {	      
	      pname:'jennifer',
	      ssn: '801010_1010101',
	      addr: 'seoul',
	      email:'a@b.com',
	      visitDate: '2019-09-29',
	      desease:'heart',
	      deseaseCode :'001',
	      content :'heart rate irregular',
	      docterName : 'Lee',
	      docterNumber: 'd001'               
            };

       
        await stub.putState('p001', Buffer.from(JSON.stringify(mr)));
        console.info('Added <--> ', mr);
        
        console.info('============= END : test insert Ledger ===========');
    }

  async queryReport(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting ssn ex: p001');
    }
    let key = args[0];

    let dataAsBytes = await stub.getState(key); //get the mr from chaincode state
    if (!dataAsBytes || dataAsBytes.toString().length <= 0) {
      throw new Error(dataAsBytes + ' does not exist: ');
    }
    console.log(dataAsBytes.toString());
    return dataAsBytes;
  }


  async createMedicalReport(stub, args) {
    console.info('============= START : createMedicalReport ===========');
    if (args.length != 11) {
      throw new Error('Incorrect number of arguments. Expecting 11');
    }

    var mr = {      
      pname: args[1],
      ssn: args[2],
      addr: args[3],
      email: args[4],
      visitDate: args[5],
      desease: args[6],
      deseaseCode : args[7],
      content : args[8],
      docterName: args[9],
      docterNumber: args[10]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(mr)));
    console.info('============= END : createMedicalReport ===========');
  }




  async getHistoryForNo(stub, args) {

    if (args.length < 1) {
      throw new Error('Incorrect number of arguments. Expecting 1, ex) p001')
    }
    let key = args[0];
    console.info('- start getHistoryForNo: %s\n', key);

    let iterator = await stub.getHistoryForKey(key);
    
    let allResults = [];
    let isHistory=true;
    while (isHistory) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults); 
        isHistory=false;      
      }
    }//end while 
    
    return Buffer.from(JSON.stringify(allResults));
  }



}

shim.start(new Chaincode());
