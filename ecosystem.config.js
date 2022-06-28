module.exports = {
  apps : [{
    name   : "wikiraces-4003",
    script : "./bin/www",
    watch: true,
    instance_var: '5',
    env: {
        "PORT": 4003,
        "NODE_ENV": "development"
    }
  }]
}
