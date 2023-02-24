function redirecthtml(req, res, url) {
    let html = `<script>window.open("${url}", "_self")</script>`;
    return res.send(html);
};

module.exports = redirecthtml;