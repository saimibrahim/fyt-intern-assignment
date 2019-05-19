import React, { Component } from 'react';
import * as firebase from 'firebase';
import { FlatList, View, Image } from 'react-native';

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

export default class App extends Component<string[],  { dataSource: string[] }> {
  constructor(props: readonly string[]) {
    super(props);
    this.state = {
      dataSource: []
    };
  }

  // retrieves image URLs from the RealTime Database
  getImageURLs = () => {
    database.ref('/').once('value').then((data) => {
      // set the dataSource in the state 
      // dataSource is an array of the download URLs of the images
      this.setState({
        dataSource: Object.values(data.val())
      })
    }).catch((error) => {
      console.log(error);
    });
  }

  componentDidMount() {
    // get the image URLs once the app has started
    this.getImageURLs();
  }

  render() {
    return (
      <View style={{margin: 5}}>
        <FlatList
          data={ this.state.dataSource }
          renderItem={({item}) => 
            <View style={{flex:1, flexDirection: 'row'}}>
              <Image source={{ uri: item }} style={{flex:1, width: '100%', height: 200, margin: 7, borderRadius: 5}} />
            </View>
          }
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}