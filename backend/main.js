const { MongoClient } = require("mongodb");
const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
const winston = require('winston');
const morgan = require('morgan');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

logger.info('Info message');
logger.error('Error message');
logger.warn('Warning message');



//const client = new  MongoClient("mongodb+srv://main_user:muser@democluster.c1xrj.mongodb.net/gamedev?retryWrites=true&w=majority");
//const client = new  MongoClient("mongodb+srv://main_user:muser@democluster.c1xrj.mongodb.net/irm?retryWrites=true&w=majority");
//const client = new  MongoClient("mongodb+srv://main_user:muser@irm-test.c1xrj.mongodb.net/Global?retryWrites=true&w=majority");
const client = new  MongoClient("mongodb+srv://main_user:muser@irm-test.cclj5.mongodb.net/Global?retryWrites=true&w=majority");

//const client = new  MongoClient("mongodb+srv://main_user:muser@irm-test.c1xrj.mongodb.net/Global?retryWrites=true&w=majority");


const server = Express();

server.use(morgan('combined'))
// create a write stream (in append mode)
//var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
//server.use(morgan('combined', { stream: accessLogStream }))

server.use(Cors());

var collection;
var loc_collection;

const stub_array  = [
    {
      "_id": "628d33ae238357006ce26f7f",
      "location": "US",
      "BX-PLUSID": "METB000028Z",
      "CS-ID": "METRX"
    },
    {
      "_id": "628d33ae238357006ce26f8b",
      "location": "US",
      "BX-PLUSID": "METB000040Z",
      "CS-ID": "METRX"
    }
]

server.get("/fetchfacet",async (request, response) =>{

    try {

        const profiler = logger.startTimer();
        let results = await collection.aggregate([
            {
                '$searchMeta': {
                'facet': {
                  'operator': {
                    'text': {
                      'query': `${request.query['BX-MAJDESC']}`,
                      'path': 'BX-MAJDESC'
                    }
                  }, 
                  'facets': {
                    'stringFacet': {
                      'type': 'string', 
                      'path': 'CS-ID', 
                      'numBuckets': 5
                    }
                  }
                }
              }
            }
          ]).toArray();
          console.log("UP thete")
          console.log(results)

        response.send(results[0]['facet']['stringFacet']['buckets']);
        profiler.done({ message: 'Logging message' });

    } catch (e) {
        logger.error('Error message');

        console.error(e);
    }
});


server.get("/get/id", async (request, response) => {
    const doc_id = `${request.query['doc_id']}`;
    console.error(request.params.id);
    console.error(request.params.id.value);

    try {
        let result = await collection.findOne({ "_id": ObjectID(request.params.id) });
        console.log(result);
        response.send(result);
    } catch (e) {
        response.status(500).send({ message: e.message });
    }
});

server.get("/fetchlocation", async (request, response) => {
  const loc_id = `${request.query['loc_id']}`;
  try {
      let filter = {'AR-ID': 'AK'};
      filter['AR-ID'] = loc_id;
      let project = {
         "_id": 0,
         "AR-NAME": 1,
         "AR-CITY": 1,
         "COMPUTE-REGION-NM": 1,
         "CSP": 1
        };
      
      let result = await ar_collection.findOne(filter,project);

      console.log(result);
      response.send(result);
  } catch (e) {
      response.status(500).send({ message: e.message });
  }
});

server.get("/fetch_distinct/", async (request, response) => {
    const field = `${request.query['field']}`;

    try {
        let result = await collection.distinct({field });
        console.log(result);
        response.send(result);
    } catch (e) {
        response.status(500).send({ message: e.message });
    }
});

server.get("/fetch_cust_byloc", async (request, response) => {
  console.log('/fetch_cust_byloc ...');
  const field = `${request.query['loc']}`;
  const us_customers = ['AFDIC','BANK1', 'METRM','CNASC', 'METRX','AONHQ','ANDSN','KRFT1','KS102','USF' ];
  const de_customers =  ['CF765','UBOC' ,'L3070','NBCUN','WABOE','L4662','FXAPR','J6122','LDISQ','LBOE5'];

  const aggpipe = [{
    $match: {
     '_id.location': 'US'
    }
   }, {
    $project: {
     '_id.Customer': 1
    }
   }, {
    $limit: 10
   }]

  
  const queryc = {'_id.location':'US'};
  const project ={"_id.Customer":1};

  console.log(queryc);
  console.log(project);
  
  try {
      //let result = await loc_collection.findOne();//aggregate(aggpipe);
      if(field == "US"){
        result = us_customers;
      }else{
        result = de_customers;
      }

      console.log(result);
      response.send(result);
  } catch (e) {
      response.status(500).send({ message: e.message });
  }
});

server.get("/dbsearch", async (request, response) =>{
    console.log('/dbsearch ..22');
    const location = `${request.query['location']}`;
    console.log(location);
    const csid = `${request.query['CS-ID']}`;
    console.log(csid);
    const bxplusid = `${request.query['BX-PLUSID']}`;
    console.log(bxplusid);


    try {
        const profiler = logger.startTimer();
        const  query_builder = {
        };
        const  project_stage = {
        };
        query_builder['location'] = location;
        query_builder['CS-ID'] = csid;
        if (bxplusid){
            query_builder['BX-PLUSID'] = bxplusid;
        }
        console.log(query_builder);

        console.log("post1");

        project_stage['CS-ID']  = 1;
        project_stage['CD-ID']  = 1; 
        project_stage['LC-ID']  = 1;
        project_stage['RN-RECCODE']  = 1;
        project_stage['BX-MAJDESC']  = 1;
        project_stage['BX-MINDESC']  = 1;
        project_stage['BX-DESTDATE']  = 1;

        console.log(project_stage)

        let results = await collection.find(query_builder).limit(10).toArray();
        response.send(results);
        profiler.done({ message: 'Database Query of find 1: Logging message' });

    }catch(e){
        response.status(500).send({ message: e.message });
    }
});


server.get("/searcha", async (request, response) =>{
    console.log('/searcha ..3');

    const aggpipe_OG = [
        {
          '$search': {
            'index': 'default', 
            'autocomplete': {
              'query': `${request.query.term}`, 
              'path': 'CS-ID', 
              'fuzzy': {
                'maxEdits': 2, 
                'prefixLength': 3, 
                'maxExpansions': 256
              }
            }
          }
        }, 
        {
            '$limit': 10
        }, {
          '$project': {
            '_id': 0, 
            'CS-ID': 1
          }
        }
      ];

      const aggpipe = [
        {
          '$search': {
            'index': 'default', 
            'autocomplete': {
              'query': `${request.query.term}`, 
              'path': 'CS-ID', 
              'fuzzy': {
                'maxEdits': 2, 
                'prefixLength': 3, 
                'maxExpansions': 256
              }
            }
          }
        }, 
        {
            '$limit': 10
        }
      ];

    try {
        const profiler = logger.startTimer();
        //'query': `${request.query.term}`,
        let results = await collection.aggregate(aggpipe).toArray();

        //console.log('returning:  '+results);

        //results2 = [{'CS-ID': "Bank1"},{'CS-ID': "Bank2"},{'CS-ID': "Bank3"},{'CS-ID': "Bank4"},{'CS-ID': "Bank5"},{'CS-ID': "Bank5"}];

        response.send(results);
        profiler.done({ message: 'searcha: Logging message' });

    }catch(e){
        response.status(500).send({ message: e.message });
    }
});



server.get("/searchac", async (request, response) =>{
    console.log('/searchac ... ??');

    const coll2 = client.db("Global").collection("Customer_by_location");

    const aggpipe = [
        {
          
          '$search': {
            'index': 'lookup',
            'autocomplete': {
              'query': `${request.query.term}`, 
              'path': '_id.Customer', 
              'fuzzy': {
                'maxEdits': 2, 
                'prefixLength': 2, 
                'maxExpansions': 256
              }
            }
          }
        }, 
        {
            '$limit': 10
        },
        {
            '$addFields': {
                'CS-ID': '$_id.Customer'
              }
        },
        {
          '$project': {
            '_id': 0,
            'CS-ID' :1
          }
        }
      ];
    
    //console.log("firing:" + aggpipe.stringify());
    try {
        const profiler = logger.startTimer();
        //'query': `${request.query.term}`,
        let results = await coll2.aggregate(aggpipe).toArray();

        console.log('returning: 22  '+ results);

        //results2 = [{'CS-ID': "Bank1"},{'CS-ID': "Bank2"},{'CS-ID': "Bank3"},{'CS-ID': "Bank4"},{'CS-ID': "Bank5"},{'CS-ID': "Bank5"}];

        response.send(results);
        profiler.done({ message: 'searchac: Logging message' });

    }catch(e){
        response.status(500).send({ message: e.message });
    }
});

server.get("/search", async (request, response) =>{
    console.log("/search.. ");
    console.log("**Outpur IN");
    console.log("**Outpur term ==> " + `${request.query.term}`);
    console.log("**Outpur pathvar ==> " + `${request.query.path_var}`);

    let aggpipe = [
        {
            "$search":{
                index: 'default',
                'text':{
                    'query': `${request.query.term}`,
                    'path': `${request.query.path_var}`,
                    'fuzzy':{
                        'maxEdits' : 2,
                        'prefixLength' :2,
                        'maxExpansions' : 256
                    }
                },
                "highlight":{
                    "path": `${request.query.path_var}`
                }
            }
        },
        {
            "$limit": 10
        }, 
        {
            $project: {
                _id: 1,
                'BX-PLUSID': 1,
                'CS-ID': 1,
                'LC-ID': 1,
                'BX-MAJDESC':1

            }
        },
        {
            "$addFields":{
                "highlights":{
                    "$meta": "searchHighlights"
                }
            }
        }

    ];
    console.log(aggpipe);
    try {
        let results = await collection.aggregate(aggpipe).toArray();
        console.log("****Outpur OUT")
        console.log(results)
        response.send(results);

    }catch(e){
        console.error(e);
    }
});

server.listen("3000", async () =>{
    try {

        await client.connect();
        //collection = client.db("GlobalSmall").collection("BoxSmall");
        collection = client.db("Global").collection("Boxes");
        loc_collection = client.db("Global").collection("Customer_by_location");
        ar_collection = client.db("Global").collection("ArchiveLocations");

    } catch (e){

        console.error(e);
    }
});
