if (process.env.NODE_ENV === 'production') {
    module.exports = { mongoURI: 'mongodb://vilasd2:vilasd2@ds145573.mlab.com:45573/vidjot-prod' }
}
else {
    module.exports = { mongoURI: 'mongodb://localhost/vidjot-dev' }
}