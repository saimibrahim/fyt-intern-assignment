import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Text, FlatList, View, Image } from 'react-native';
import { FileSystem } from 'expo';

// configuration for firebase
const config = {
  apiKey: "AIzaSyCjlI0XMWym53c1F0TxMWvgXfGhYXXKfJY",
  authDomain: "fyt-intern-assginment.firebaseapp.com",
  databaseURL: "https://fyt-intern-assginment.firebaseio.com",
  storageBucket: "fyt-intern-assginment.appspot.com"
};

firebase.initializeApp(config);

// Get a reference to the database service
const database = firebase.database();

export default class App extends Component<string[],  { dataSource: CachedAsset[],  imageData: Object}> {
  constructor(props: readonly string[]) {
    super(props);
    this.state = {
      dataSource: [],
      imageData: {}
    };
  }

  // retrieves image URLs from the RealTime Database
  getImageURLs = async () => {
    await database.ref('/').once('value').then((data) => {
      // get the image data from the database
      this.setState({
        imageData: data.val()
      })

    }).catch((error) => {
      console.log(error);
    });
  }

  // checks the cache and downloads those resources which are not stored
  checkCache = async (imageData: Object, dataSource: CachedAsset[]) => {
    let imageNames: string[] = Object.keys(imageData);
    let imageURIs: string[] = Object.values(imageData);
    
    // check all the required images and download those which are not cached
    for (let i = 0; i < imageNames.length; i++) {
      if (dataSource.filter((asset) => asset.remoteURI === imageURIs[i]).length == 0) {
        // in this case there is nothing with the URI which is cached, so we will we create a new CacheAsset
        await FileSystem.downloadAsync(imageURIs[i], FileSystem.documentDirectory + imageNames[i] + '.png').then(({ uri }) => {
          dataSource.push(new CachedAsset(imageURIs[i], uri));
        })
        .catch(error => {
          console.error(error);
        });
      }
    }

    // set the state so the that component renders again
    this.setState({
      imageData: imageData,
      dataSource: dataSource
    })
  }

  componentDidMount() {
    // get the image URLs once the app has started
    this.getImageURLs();
    this.checkCache(this.state.imageData, this.state.dataSource);
  }
  
  // TODO: fix rendering issue where non of the images currently display on screen
  render() {
    return (
      <View style={{margin: 5}}>
        <FlatList
          data={ this.state.dataSource }
          renderItem={({item}) => 
            <View style={{flex:1, flexDirection: 'row'}}>
              <Image source={{ uri: item.localURI }} style={{flex:1, width: '100%', height: 200, margin: 7, borderRadius: 5}} />
            </View>
          }
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}

// a model to store information about cached resources
class CachedAsset {
  remoteURI: string;
  localURI: string;
  lastUpdated: Date;

  constructor(remoteURI: string, localURI: string) {
    this.remoteURI = remoteURI;
    this.localURI = localURI;
    // set the time last updated to the current time on creation
    this.lastUpdated = new Date();
  }
}