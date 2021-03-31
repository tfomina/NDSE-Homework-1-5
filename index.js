const http = require("http");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const mbar_to_mmHg_ratio = 0.75006375541921;

const ACCESS_KEY = process.env.ACCESS_KEY;
const generateUrl = (city) =>
  `http://api.weatherstack.com/current?access_key=${ACCESS_KEY}&query=${city}&units=m`;

const options = yargs(hideBin(process.argv))
  .option("c", {
    alias: "city",
    demandOption: true,
    describe: "Название города",
    type: "string",
  })
  .check((argv) => {
    if (!argv.city) {
      console.error("Название города не может быть пустым");
      process.exit(-1);
    } else {
      return true;
    }
  })
  .fail((msg, err, yargs) => {
    if (err) throw err;
    console.error("Ошибка!");
    console.error(msg);
    console.error(yargs.help());
    process.exit(-1);
  })
  .strict()
  .help().argv;

const url = generateUrl(options.city);

http.get(url, (res) => {
  const statusCode = res.statusCode;

  if (statusCode !== 200) {
    console.error(`Status code ${statusCode}`);
    return;
  }

  res.setEncoding("utf8");
  let rawData = "";
  res.on("data", (chunk) => (rawData += chunk));
  res
    .on("end", () => {
      const parsedData = JSON.parse(rawData);

      console.log(
        `Погода в городе ${parsedData.location.name} (${parsedData.location.country})`
      );
      console.log(`Температура: ${parsedData.current.temperature}℃`);
      console.log(
        `Описание погоды: ${parsedData.current.weather_descriptions}`
      );
      console.log(
        `Скорость ветра: ${(parsedData.current.wind_speed * (5 / 18)).toFixed(
          2
        )} м/с`
      );
      console.log(
        `Давление: ${(parsedData.current.pressure * mbar_to_mmHg_ratio).toFixed(
          2
        )} мм. ртутного столба`
      );
      console.log(`Влажность: ${parsedData.current.humidity}%`);
    })
    .on("error", (e) => {
      console.error(`Ошибка: ${e.message}`);
    });
});
