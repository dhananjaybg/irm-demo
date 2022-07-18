function remove_dupes(arr){
    var unique = arr.reduce(function (acc, curr) {
        if (!acc.includes(curr))
            acc.push(curr);
        return acc;
    }, []);
    return unique;
}

pass_array2 = [
    { 'RN-RECCODE': 'FN-FNC-100' },
    { 'RN-RECCODE': 'FN-FNC-100' },
    { 'RN-RECCODE': 'FN-FNC-100' },
    { 'RN-RECCODE': 'FN-GNL-200' },
    { 'RN-RECCODE': 'FN-GNL-200' },
    { 'RN-RECCODE': 'FN-CRC-600' },
    { 'RN-RECCODE': 'FN-CRC-600' },
    { 'RN-RECCODE': 'FN-CRC-600' },
    { 'RN-RECCODE': 'FN-CRC-600' },
    { 'RN-RECCODE': 'FN-CRC-600' }
];


const aggpipe = [
    {
      '$search': {
        'compound': {
          'must': [
            {
              'autocomplete': {
                'query': "${request.query.term}", 
                'path': 'grgqergqerh', 
                'fuzzy': {
                  'maxEdits': 2, 
                  'prefixLength': 2, 
                  'maxExpansions': 256
                }
              }
            }, {
              'text': {
                'query': 'grgqergqerh', 
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
        '_id': 'RN-RECCODE2'
      }
    }
  ];

pass_array = [ 'FN-CRC-600' , 'FN-CRC-200' ,'FN-CRC-200' ,'FN-CRC-600' ,'FN-CRC-300','FN-CRC-300'];
//console.log(remove_dupes(pass_array));

console.log(aggpipe);

console.log(aggpipe[3]['$group']['_id'])

aggpipe[3]['$group']['_id'] = "RIP_VAN_WINKLE"


console.log(aggpipe[3]['$group']['_id'])