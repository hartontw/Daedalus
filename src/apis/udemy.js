const request = require('request');
const cheerio = require('cheerio');

const HOST = 'https://www.udemy.com';
const API = `${HOST}/api-2.0`;

const headers = {
    "Accept": "application/json, text/plain, */*",
    "Authorization": "Basic " + Buffer.from(`${process.env.UDEMY_ID}:${process.env.UDEMY_SECRET}`).toString('base64'),
    "Content-Type": "application/json;charset=utf-8",
};

function get(url) {
    return new Promise( (resolve, reject) => {
        if (url.indexOf(API) === 0) {
            request({
                url,
                headers
            }, (error, response, body) => {
                if (!error) {
                    if (response.statusCode == 200) {
                        resolve(JSON.parse(body));
                    }
                    else reject(response.statusCode);
                }
                else reject(error);
            });
        }
        else reject(`Invalid url ${url}`);
    });
}

function getQuery(query, search = {}) {    
    query = `${API}/${query}/?fields[course]=@default,created`;

    const params = [];
    for(let field in search) {
        if (field === 'page') field = Math.min(search[field], 10000);
        params.push(`${field}=${search[field]}`);
    }    
    if (params.length > 0) {
        query += `&${params.join('&')}`;
    }
    
    return query;
}

function getCoursesList(search) {
    const query = getQuery('courses', search);
    return get(query);
} 

function getCoursesDetail(course_id) {
    const query = getQuery(`courses/${course_id}`);
    return get(query);
}

function getCourseReviewList(course_id, search) {
    const query = getQuery(`courses/${course_id}/reviews`, search);
    return get(query);
}

function getPublicCurriculumItems(course_id, search) {
    const query = getQuery(`courses/${course_id}/public-curriculum-items`, search);
    return get(query);
}

function getModels(url, selector) {
    return new Promise( (resolve, reject) => {       
        request(HOST+url, (err, res, body) => {
            if (!err)  {                  
                const categories = [];              
                const $ = cheerio.load(body);
                $(selector).each(function (i, elm) {
                    categories.push($(elm).text());
                });
                resolve(categories);
            }
            else reject(err);
        });
    });
}

function getCourseCategories() {
    return getModels('/developers/affiliate/models/course-category/', 'span.developers__pill.udlite-heading-xs');
}

function getCourseSubCategories() {
    return getModels('/developers/affiliate/models/course-subcategory/', 'span.developers__pill.udlite-heading-xs');
}

module.exports = {
    get,
    getQuery,
    getCoursesList,
    getCoursesDetail,
    getCourseReviewList,
    getPublicCurriculumItems,
    getCourseCategories,
    getCourseSubCategories
}