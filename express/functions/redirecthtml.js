function redirecthtml(req, res, url) {
    // let html = `<script>window.open("${url}", "_self")</script>`;
    let html = `<script>document.location.replace("${url}")</script>`;
    return res.send(html);
};

module.exports = redirecthtml;