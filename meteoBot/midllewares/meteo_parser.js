const images_path  = {
    "Clear": 'images/clear_sky.png',
    "Clouds": 'images/clouds.png',
    "Rain": 'images/rain.jpg',
    "Thunderstorm ": 'images/thunderstorm.jpg',
    "Snow": 'images/snow.png',
    "Mist": 'images/mist.png',
};

const MeteoParserMiddleware = {

    parseFullMeteo: (json_data) => {
        var current_data = JSON.parse(json_data);
        var weather = current_data.weather[0].description;
        var temp = current_data.main.temp;
        var humidity = current_data.main.humidity;
        var img_url = images_path[current_data.weather[0].main];
        return { weather, temp, humidity, img_url };
    }

}

function convertToCelcius(temp) {
    //Temp is a string, convert to float
    temp = parseFloat(temp)
    if (isNaN(temp)) return 0;
    return ((temp - 32) / 1.8);
}

module.exports = MeteoParserMiddleware;