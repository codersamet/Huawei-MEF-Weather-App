import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import WeatherInfo from './components/WeatherInfo'
import UnitsPicker from './components/UnitsPicker'
import ReloadIcon from './components/ReloadIcon'
import WeatherDetails from './components/WeatherDetails'
import { colors } from './utils/index'
import HMSLocation from '@hmscore/react-native-hms-location';

export default function App() {
    const [errorMessage, setErrorMessage] = useState(null)
    const [currentWeather, setCurrentWeather] = useState(null)
    const [unitsSystem, setUnitsSystem] = useState('metric')

    useEffect(() => {
        load()
    }, [unitsSystem])

    async function load() {
        setCurrentWeather(null)
        setErrorMessage(null)

        const GetPermissions = () => {
            const [hasLocationPermission, setHasLocationPermission] = useState(false);
            const [position, setPosition] = useState();
            useEffect(() => {
              HMSLocation.FusedLocation.Native.hasPermission()
                .then((result) => setHasLocationPermission(result))
                .catch(HMSLocation.FusedLocation.Native.requestPermission());
            }, []);
            if (hasLocationPermission) {
              HMSLocation.FusedLocation.Native.getLastLocation()
                .then((pos) => setPosition(pos))
                .catch((err) => console.log('Failed to get last location', err));     
               }
                else {
              HMSLocation.FusedLocation.Native.requestPermission();
              }
          };

        try {
            let { status } = await HMSLocation.hasPermission()

            if (status !== 'true') {
                setErrorMessage('Access to location is needed to run the app')
                return
            }

            const location = await HMSLocation.getLastLocation()

            const latitude = location.position.latitude

            const longitude= location.position.longitude

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unitsSystem}&appid=${API}`

            const response = await fetch(weatherUrl)

            const result = await response.json()

            if (response.ok) {
                setCurrentWeather(result)
            } else {
                setErrorMessage(result.message)
            }
        } catch (error) {
            setErrorMessage(error.message)
        }
    }
    if (currentWeather) {
        return (
            <View style={styles.container}>
                <StatusBar style="auto" />
                <View style={styles.main}>
                    <UnitsPicker unitsSystem={unitsSystem} setUnitsSystem={setUnitsSystem} />
                    <ReloadIcon load={load} />
                    <WeatherInfo currentWeather={currentWeather} />
                </View>
                <WeatherDetails currentWeather={currentWeather} unitsSystem={unitsSystem} />
            </View>
        )
    } else if (errorMessage) {
        return (
            <View style={styles.container}>
                <ReloadIcon load={load} />
                <Text style={{ textAlign: 'center' }}>{errorMessage}</Text>
                <StatusBar style="auto" />
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
                <StatusBar style="auto" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    main: {
        justifyContent: 'center',
        flex: 1,
    },
})