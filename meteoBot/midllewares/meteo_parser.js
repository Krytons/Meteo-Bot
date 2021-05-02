const MeteoParserMiddleware = {

    parseFullMeteo: (json_data) => {
        var current_data = JSON.parse(json_data);
        var weather = current_data.weather[0].description;
        var temp = convertToCelcius(current_data.main.temp);
        var humidity = current_data.humidity;
        return (weather, temp, humidity);
    }

}

function convertToCelcius(temp) {
    //Temp is a string, convert to float
    temp = parseFloat(temp)
    if (isNaN(temp)) return 0;
    return ((temp - 32) / 1.8);
}

module.exports = MeteoParserMiddleware;