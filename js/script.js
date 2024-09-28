//5-day forecast API https://openweathermap.org/forecast5
//https://api.openweathermap.org/data/2.5/forecast?lat=49.4285&lon=32.0621&appid=2516d7b16bddecafc54e491f03da8399
const urlWeatherAPIprefix = 'https://api.openweathermap.org/data/2.5/weather?q=';
const urlWeatherAPIsufix = '&appid=2516d7b16bddecafc54e491f03da8399&units=metric';

let cityWeather = {};
function init() {
    let storedCity = localStorage.getItem("cityName");
    let city = storedCity ? storedCity : "Lviv";
    loadWeather(city);
    $('#city_name').val(city);
    $('#search_btn').click(function () {
        let city = $('#city_name').val();
        loadWeather(city);
    });

}
function loadWeather(city) {
    let urlWeather = urlWeatherAPIprefix + city + urlWeatherAPIsufix;
    $.ajax({
        url: urlWeather,
        method: 'GET',
        success: function (weather) {
            initCityWeather(weather);
            localStorage.setItem('cityName', city);
            let lon = weather.coord.lon;
            let lat = weather.coord.lat;
            console.log('lon: ' + lon);
            console.log('lat: ' + lat);
            load5dayWeather(lon, lat);
            let countCity = 5;
            loadNerbyPlaceWeather(lon, lat, countCity);
        },
        error: function () {
            alert("Error: " + error.status);
        }
    });
}
let city5dayWeather = {};
function load5dayWeather(lon, lat) {
    let urlWeather = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=2516d7b16bddecafc54e491f03da8399';
    $.ajax({
        url: urlWeather,
        method: 'GET',
        success: function (data) {
            city5dayWeather = data;
            initDayButtons(city5dayWeather.list);
            initTableHourlyWeather('Today', city5dayWeather.list, 0, 8);
        },
        error: function (error) {
            alert("Error: " + error.status);
        }
    });
}
function initTableHourlyWeather(day, list, from, upto) {

    let tr_time = "<tr><th scope='col'>" + day + "</th>";

    let tr_img = "<tr><th scope='row'></th>";
    let tr_desc = "<tr><th scope='row'>Forecast</th>";
    let tr_temp = "<tr><th scope='row'>Temp (°C)</th>";
    let tr_feel = "<tr><th scope='row'>RealFeel</th>";
    let tr_wind = "<tr><th scope='row'>Wind (m/s)</th>";

    for (let i = from; i < upto; i++) {

        let time = list[i].dt_txt.substring(11, 16);
        tr_time += "<th scope='col'>" + time + "</th>"

        let icon = list[i].weather[0].main;
        tr_img += "<td><img src='img/" + icon + ".png'></td>";
        tr_desc += "<td>" + icon + "</td>";

        let temp = list[i].main.temp;
        tr_temp += "<td>" + toCelsiusFromKelvin(temp) + "°</td>";
        let feels_like = list[i].main.feels_like;
        tr_feel += "<td>" + toCelsiusFromKelvin(feels_like) + "°</td>";
        let wind = list[i].wind.speed;
        tr_wind += "<td>" + wind + "</td>";
    }
    tr_time += "</tr>";
    tr_img += "</tr>";
    tr_desc += "</tr>";
    tr_temp += "</tr>";
    tr_feel += "</tr>";
    tr_wind += "</tr>";
    $("#table_head_hourly_weather").html(tr_time);
    $("#table_body_hourly_weather").html(tr_img + tr_desc + tr_temp + tr_feel + tr_wind);
}
function toCelsiusFromKelvin(temp) {
    return Math.round(temp - 273.15);
}
function addZero(digit) {
    return digit < 10 ? '0' + digit : digit;
}
function initCityWeather(weather) {
    $("#weather_current_city").text("Current Weather in " + weather.name);
    let icon = weather.weather[0].main;
    $("#weather_img").attr("src", "img/" + icon + ".png");
    $("#weather_description").text(weather.weather[0].description);
    $("#current_temp").text(weather.main.temp + "°C");
    $("#current_feels_like").text(weather.main.feels_like + "°C");
    let sunrise = new Date(weather.sys.sunrise * 1000);
    let sunset = new Date(weather.sys.sunset * 1000);
    let duration = new Date(weather.sys.sunset - weather.sys.sunrise);
    let durationHr = Math.floor(duration / 3600);
    let durationMn = Math.floor((duration % 3600) / 60);
    $("#current_sunrise").text(addZero(sunrise.getHours()) + ':' + addZero(sunrise.getMinutes()) + ':' + addZero(sunrise.getSeconds()));
    $("#current_sunset").text(addZero(sunset.getHours()) + ':' + addZero(sunset.getMinutes()) + ':' + addZero(sunset.getSeconds()));
    $("#current_duration").text(addZero(durationHr) + ':' + addZero(durationMn));
}
let nearbyPlaceWeather = {};
function loadNerbyPlaceWeather(lon, lat, countCity) {
    let urlWeather = 'https://api.openweathermap.org/data/2.5/find?lat=' + lat + '&lon=' + lon + '&cnt=' + countCity + '&appid=2516d7b16bddecafc54e491f03da8399';
    $.ajax({
        url: urlWeather,
        method: 'GET',
        success: function (data) {
            nearbyPlaceWeather = data;
            initNearbyPlaceWeather(nearbyPlaceWeather.list);
        },
        error: function (error) {
            alert("Error: " + error.status);
        }
    });
}
function initNearbyPlaceWeather(nearbyPlaceWeather) {
    let content = '<div class="box-init box"><span>${cityName}</span><img height="70%" src="img/${weather}.png">${temp}°C</div>';
    $("#nearby_place_weather").html('');
    nearbyPlaceWeather.slice(1).forEach(nearbyPlace => {
        let item = content.replace("${cityName}", nearbyPlace.name)
            .replace("${weather}", nearbyPlace.weather[0].main)
            .replace("${temp}", toCelsiusFromKelvin(nearbyPlace.main.temp));
        $("#nearby_place_weather").append(item);
    });
}
function initDayButtons(list) {
    let content = '<div id="${id}" class="weather_item ${active}"><a onclick="selectDay(\'${day}\',${dataFrom},${dataTo});" href="#" class="card-link "> ${day}<br>${shortDate}<br><img src="img/${img_name}.png"><br><h1>${temp}°C</h1>${description}</a></div>';
    let currentDay = moment(list[0].dt_txt, "YYYY-MM-DD hh:mm:ss");
    currentDay = currentDay.toDate();
    let dayIndex = currentDay.getDay();
    $("#weather-flex-container").html('');
    for (let i = 0; i < list.length; i += 8) {
        let date = moment(list[i].dt_txt, "YYYY-MM-DD hh:mm:ss");
        date = date.toDate();
        let from = (i == 0) ? 0 : getFirstIndexForDay(date.getDate());
        let item = content.replaceAll("${id}", "day" + from)
            .replace("${active}", i == 0 ? "weather_item-active" : "")
            .replace("${dataFrom}", from)
            .replace("${dataTo}", from + 8)
            .replace("${shortDate}", getShortFormatDate(list[i].dt_txt))
            .replaceAll("${day}", i == 0 ? "Today" : days[dayIndex % 7])
            .replace("${img_name}", list[i].weather[0].main)
            .replace("${temp}", toCelsiusFromKelvin(list[i].main.temp))
            .replace("${description}", list[i].weather[0].main);
        dayIndex++;
        $("#weather-flex-container").append(item);
    }
}
function getFirstIndexForDay(day) {
    let firstIndex = 0;
    let i = 0;
    while (i < city5dayWeather.list.length) {
        let date = moment(city5dayWeather.list[i].dt_txt, "YYYY-MM-DD hh:mm:ss");
        date = date.toDate();
        if (date.getDate() == day) {
            firstIndex = i;
            break;
        }
        i++;
    }
    return firstIndex;
}
const monthNames = ["month", "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"
];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function getShortFormatDate(textDate) {
    let dateItems = textDate.split('-');
    let month = dateItems[1][0] == 0 ? parseInt(dateItems[1][1]) : parseInt(dateItems[1]);
    let day = dateItems[2].substr(0, 2);
    return monthNames[month] + ' ' + day;
}
function selectDay(day, from, to) {
    $("#weather-flex-container .weather_item").each(function (i, item) {
        $(item).attr('class', 'weather_item');
    });
    $('#day' + (from)).attr('class', 'weather_item weather_item-active');
    initTableHourlyWeather(day, city5dayWeather.list, from, to);
}