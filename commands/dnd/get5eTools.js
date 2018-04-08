const axios = require('axios');
const config = require('../../config.json').commandConfig['dnd'];
const atob = require('atob');

const request = async (url)=>{
  return await axios.get(url, {
    auth: config.auth
  })
}

const repo = 'https://api.github.com/repos/TheGiddyLimit/TheGiddyLimit.github.io/'
const repoContents = repo + 'contents/'

const getFile = async (fileData)=>{
  let dataBlob = {};
  try{
    dataBlob = (await request(fileData.url)).data.content;
  } catch (errBLOB) {
    //console.log("Couldn't load from file API, attempting git API");
    dataBlob = (await request(fileData.git_url)).data.content;
  }

  let data = {};
  let json = '';
  try{
    json = atob(dataBlob);
    // Weird fix because sometimes it prepends stuff to blob?
    if(json[0] !== '{')
      json = json.substr(json.indexOf('{'));
    data = JSON.parse(json);
  }catch (errJSON){
    //console.log("Couldn't parse blob: " + fileData.path);
    //console.log(json.substr(0, 30));
  }

  if(Object.keys(data).length === 1)
    return data[Object.keys(data)[0]];
  return data;
}

const getDir = async (path)=>{
  const index = (await request(repoContents + path)).data;

  const data = {};

  for(const property of index){
    if(property.type === 'dir')
      data[property.name] = await getDir(property.path);
    if(property.type === 'file'){
      const propName = property.name.split('.')[0];
      const propData = await getFile(property);
      //If we don't already have that property, assign it
      if(!data.hasOwnProperty(propName))
        data[propName] = propData;
      //If we do have that property, and it's an array, add to it
      else if (Array.isArray(data[propName]) && Array.isArray(propData))
        data[propName] = data[propName].concat(propData);
    }
  }

  if(Object.keys(data).length === 1)
    return data[Object.keys(data)[0]];
  return data;
}

module.exports = async function(user, repoName){
  //console.log('beginning request')
  const data = await getDir('data')
  //console.log(data);
  return data;
}
