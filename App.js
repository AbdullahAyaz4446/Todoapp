import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Alltask from './Components/Alltask'


const App = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Alltask />
    </View>
  )
}

export default App

const styles = StyleSheet.create({})