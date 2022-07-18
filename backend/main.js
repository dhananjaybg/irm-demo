const { MongoClient, ObjectId } = require("mongodb");
const Express = require("express");

const config = require('config');


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

const SRV  = config.get('atlas.srv');
const client = new  MongoClient(SRV);

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
      "id":1,
      "_id": "628d33ae238357006ce26f7f",
      "location": "US",
      "BX-PLUSID": "METB000028Z",
      "CS-ID": "METRX"
    },
    {
      "id":2,
      "_id": "628d33ae238357006ce26f8b",
      "location": "US",
      "BX-PLUSID": "METB000040Z",
      "CS-ID": "METRX"
    },
    {
      "id":3,
      "_id": "t3teg52y2565g435y74ygg45g",
      "location": "DE",
      "BX-PLUSID": "RWTQWT5345",
      "CS-ID": "FSDFRCD"
    }
]

server.get("/fetch4tables", async (request, response) => {
  let samba = {};
  samba["data"] = stub_array;
  console.log("Show SAMBA **************************");
  response.send(samba);
});

server.get("/fetchfacet",async (request, response) =>{
  console.log("/fetchfacet...");
  //let c = `${request.query.BX-MAJDESC.value}`;
  //let d = `${request.query.BX-MAJDESC}`;
  //alert(c+d);

  const facetpipe = [
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
            'dateFacet': {
              'type': 'date', 
              'path': 'BX-DESTDATE', 
              'boundaries': [
                new Date('Thu, 01 Jan 2004 00:00:00 GMT'), new Date('Sat, 01 Jan 2005 00:00:00 GMT'), new Date('Sun, 01 Jan 2006 00:00:00 GMT'), new Date('Mon, 01 Jan 2007 00:00:00 GMT')
              ], 
              'default': 'other'
            }
          }
        }
      }
    }
  ];

    try {

        const profiler = logger.startTimer();
        let results = await collection.aggregate(facetpipe).toArray();
          console.log("UP thete")
          console.log(results)

        response.send(results[0]['facet']['dateFacet']['buckets']);
        profiler.done({ message: 'Logging message' });

    } catch (e) {
        logger.error('Error message');
        console.error(e);
    }
});

server.get("/getdoc", async (request, response) => {
    console.log("somethign something");
    const doc_id = `${request.query.docid}`;
    console.log(doc_id);
    try {
        let query = {}
        query['_id'] = new ObjectId(doc_id);
        let result = await collection.findOne(query,{});
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
    console.log('/dbsearch .. classic..');
    const location = `${request.query['location']}`;
    console.log(location);
    const csid = `${request.query['CS-ID']}`;
    console.log(csid);
    const bxplusid = `${request.query['bx_plusid']}`;
    console.log(bxplusid);
    const rnreccode = `${request.query['rn_reccode']}`;
    console.log(rnreccode);


    try {
        const profiler = logger.startTimer();
        const  query_builder = {};
        const  project_stage = {};

        query_builder['location'] = location;
        query_builder['CS-ID'] = csid;
        if (bxplusid){
            query_builder['BX-PLUSID'] = bxplusid;
        }
        if (rnreccode){
          query_builder['RN-RECCODE'] = rnreccode;
        }

        console.log(query_builder);
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

server.get("/searchac2", async (request, response) =>{
    console.log('/searchac2... >>> FOR RN-RECODE >>>');
  
    let lkp = `${request.query.lkup_field}`;
  
    const aggpipe = [
      {
        '$search': {
          'compound': {
            'must': [
              {
                'autocomplete': {
                  'query': `${request.query.term}`, 
                  'path': `${request.query.lkup_field}`, 
                  'fuzzy': {
                    'maxEdits': 2, 
                    'prefixLength': 2, 
                    'maxExpansions': 256
                  }
                }
              }, {
                'text': {
                  'query': `${request.query.cs_id}`, 
                  'path': 'CS-ID'
                }
              }
            ]
          }
        }
      }, {
        '$limit': 10
      }, {
        '$project': {
          '_id': 0, 
          'RN-RECCODE': 1
        }
      }, {
        '$group': {
          '_id': '$RN-RECCODE555'
        }
      }
    ];

    //console.log(aggpipe);
    let llp = lkp;
    aggpipe[2]['$project'][llp] = 1;
    aggpipe[3]['$group']['_id'] = "$"+llp;
    //console.log(aggpipe);

    try {
        const profiler = logger.startTimer();
        //'query': `${request.query.term}`,
        let results = await collection.aggregate(aggpipe).toArray();
        //console.log(results)
        response.send(results);
        profiler.done({ message: 'searchac: Logging message' });

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
      { '$limit': 10 },
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
    console.log("/search.. simple ");
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
                'CS-ID': 1,
                'LC-ID': 1,
                'BX-PLUSID': 1,
                'RN-RECCODE':1,
                'BX-MAJDESC':1,
                'BX-MINESC':1,
                'BX-DESTDATE':1
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

server.get("/search_cpd", async (request, response) =>{
  console.log("/search compound /");
  const location = `${request.query['location']}`;
  console.log(location);
  const csid = `${request.query['CS-ID']}`;
  console.log(csid);
  const bxplusid = `${request.query['bx_plusid']}`;
  console.log(bxplusid);
  const bxmajdesc = `${request.query['bx_majdesc']}`;
  console.log(bxmajdesc);
  const rnreccode = `${request.query['rn_reccode']}`;
  console.log(rnreccode);

  const search_cpd_stage = {};
  const project_stage = {};
  const pipe = [];
  const must_arr = [];

  try{
      const must_loc_q = {}
      must_loc_q['text'] = {};
      must_loc_q['text']['query'] =  `${request.query['location']}`;
      must_loc_q['text']['path'] = "location";

      const must_cust_q = {}
      must_cust_q['text']={};
      must_cust_q['text']['query'] = `${request.query['CS-ID']}`;
      must_cust_q['text']['path'] = "CS-ID";

      const must_desc_q = {}
      must_desc_q['text']={}
      must_desc_q['text']['query'] = `${request.query['bx_majdesc']}`;
      must_desc_q['text']['path'] = "BX-MAJDESC";

      must_arr.push(must_loc_q);
      must_arr.push(must_cust_q);
      must_arr.push(must_desc_q);


      search_cpd_stage['$search'] = {};
      search_cpd_stage['$search']['compound']= {};
      search_cpd_stage['$search']['compound']['must']= must_arr;
      search_cpd_stage['$search']['highlight']= {};
      search_cpd_stage['$search']['highlight']['path']= "BX-MAJDESC";
      
      //console.log(JSON.stringify(search_cpd_stage));
      const project_st = {};
      project_st['_id']  = 1;
      project_st['CS-ID']  = 1;
      project_st['LC-ID']  = 1; 
      project_st['BX-PLUSID']  = 1;
      project_st['RN-RECCODE']  = 1;
      project_st['BX-MAJDESC']  = 1;
      project_st['BX-MINDESC']  = 1;
      project_st['BX-DESTDATE']  = 1;
      project_st['highlights'] = {};
      project_st['highlights']['$meta'] = 'searchHighlights';
      
      project_stage['$project']= project_st;

      console.log(project_stage)

      const limit_stage ={};
      limit_stage['$limit']  = 15;

      pipe.push(search_cpd_stage);
      pipe.push(project_stage); 
      pipe.push(limit_stage);
      

    }catch(e){
      //response.status(500).send({ message: e.message });
      console.log(e.message);
  };

  console.log("DISPLAY _PIPE");
  console.log(pipe);

  try {
    let results = await collection.aggregate(pipe).toArray();
    console.log(results)
    response.send(results);

  }catch(e){
    console.error(e);
  }

});


server.get("/search_cpd_BCK", async (request, response) =>{
  console.log("/search compound /");
  console.log("**Outpur term ==> " + `${request.query.cust_id}`);
  console.log("**Outpur pathvar ==> " + `${request.query.desc_term}`);
  
  let cust_val = `${request.query.cust_id}`;
  let desc_val = `${request.query.desc_term}`;
  let desc_path = `${request.query.path_var}`;

  console.log(cust_val+desc_val+desc_path);
  let aggpipe = [
    {
      '$search': {
        'compound': {
          'must': [
            {
              'text': {
                'query': `${request.query.desc_term}`, 
                'path': `${request.query.path_var}`
              }
            }, {
              'text': {
                'query': `${request.query.cust_id}`, 
                'path': 'CS-ID'
              }
            }
          ]
        }, 
        'highlight': {
          'path': `${request.query.path_var}`
        }
      }
    }, {
      '$project': {
        '_id': 1, 
        'CS-ID': 1, 
        'LC-ID': 1, 
        'BX-PLUSID': 1, 
        'BX-MAJDESC': 1, 
        'BX-MINDESC': 1, 
        'RN-RECCODE': 1, 
        'BX-DESTDATE': 1, 
        'highlights': {
          '$meta': 'searchHighlights'
        }
      }
    }, {
      '$limit': 15
    }
  ]

  console.log(aggpipe);
  try {
      let results = await collection.aggregate(aggpipe).toArray();
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
