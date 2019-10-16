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



async check_key(stub, args) { 
        if (args.length != 1) {
          throw new Error('Incorrect number of arguments. Expecting ssn ex: p001');
        }
        let key = args[0];
        
        let accountBytes = await stub.getState(key); //get the mr from chaincode state
        if (!accountBytes || accountBytes.toString().length <= 0) {
          throw new Error(accountBytes + ' does not exist: ');
        }
        
        console.info('============= END : check_key ===========');
        return accountBytes;
       }


  
async delete_account(stub, args){
        if(args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting ssn ex: p001');
        }
        let key = args[0];
        await stub.deleteState(key);
        console.log('Account deleted from the ledger Succesfully..');

        
        }     

async create_account(stub, args){
            if(args.length != 1){
                throw new Error('에러났음');
            }
            let key = args[0];
            let degree = [];
            let career = [];
            let cert = [];
            
	    let account = { degree, career, cert }
            await stub.putState (key, Buffer.from(JSON.stringify(account)));                
            }
                    

async update_degree(stub,params_degree){
                let degree_key = params_degree[0];
		let type = params_degree[1]
                let name = params_degree[2];
                let birth = params_degree[3];
                let dept = params_degree[4];
                let date = params_degree[5];
                let degree = params_degree[6];
                let code = params_degree[7];
  		let create_at = params_degree[8];

		let tmp = { type, name , birth , dept , date , degree , code, create_at};

                const accountBytes = await stub.getState(degree_key);
                if(!accountBytes || accountBytes.length === 0){
                    throw new Error(`${params_degree.key} does not exist`);
                }
        
                const account = JSON.parse(accountBytes.toString());

		account.degree.push(tmp);
              
                await stub.putState(degree_key, Buffer.from(JSON.stringify(account)));
                console.info('============= END : update_degree ===========');
        
            }
            
async update_career(stub,params_career){
                let career_key = params_career[0];
                let name = params_career[1];
                let birth = params_career[2];
                let date_join  = params_career[3];
                let date_leave = params_career[4];
                let dept = params_career[5];
                let career_rank = params_career[6];
		let create_at = params_career[7];

		let tmp = { name, birth, date_join, date_leave, dept, career_rank, create_at };

                const accountBytes = await stub.getState(career_key);
                if(!accountBytes || accountBytes.length === 0){
                    throw new Error(`${career_key} does not exist`);
                }
        
                const account = JSON.parse(accountBytes.toString());
      
                account.career.push(tmp);
              
                await stub.putState(career_key, Buffer.from(JSON.stringify(account)));
                console.info('============= END : update_degree ===========');
        
            }
            
async update_cert(stub,params_cert){
                let cert_key = params_cert[0];
                let title = params_cert[1];  
                let grade = params_cert[2]; 
                let serial = params_cert[3]; 
                let date = params_cert[4];
		let create_at = params_cert[5];

		let tmp = { title, grade, serial, date, create_at };
		
 
                const accountBytes = await stub.getState(cert_key);
                
                if(!accountBytes || accountBytes.length === 0){
                    throw new Error(`${cert_key} does not exist`);
                }
        
                const account = JSON.parse(accountBytes.toString());
		
		account.cert.push(tmp);
                
                await stub.putState(cert_key, Buffer.from(JSON.stringify(account)));
                console.info('============= END : update_cert ===========');
        
            }
        
            
}

shim.start(new Chaincode());
