import re
import unicodedata
from builtins import print

import cx_Oracle
import pandas as pd
from flask import Flask, render_template, jsonify
from flask import request
from nltk import word_tokenize
from nltk.corpus import stopwords
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix
import re
import unicodedata
from builtins import print
from random import choice
from fuzzywuzzy import process
from numpy import argmax
from re import match

from data import Articles

p_username = "DIVA"
p_password = "DIVA"
p_host = "localhost"
p_service = "orclpdb.myfiosgateway.com"
p_port = "1521"


def OutputTypeHandler(cursor, name, defaultType, size, precision, scale):
    if defaultType == cx_Oracle.CLOB:
        return cursor.var(cx_Oracle.LONG_STRING, arraysize=cursor.arraysize)
    if defaultType == cx_Oracle.BLOB:
        return cursor.var(cx_Oracle.LONG_BINARY, arraysize=cursor.arraysize)


con = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                        encoding="UTF-8",
                        nencoding="UTF-8")
con_wine = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                             encoding="UTF-8",
                             nencoding="UTF-8")
con_wine_cloud = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                                   encoding="UTF-8",
                                   nencoding="UTF-8")
con_wine_cloud.outputtypehandler = OutputTypeHandler
df = pd.read_sql_query("select ROWNUM AS INDEXCOL,price,POINTS,TITLE FROM WINE where ROWNUM<100", con)

# df1 = pd.read_sql_query(
#     "SELECT two_letter_country_code AS ID, c.country_name AS COUNTRY, NVL(c_wine_cnt,0) AS NO_OF_WINES,"
#     " c.continent_name AS CONTINENT, NVL(winery_cnt,0) as WINERY_CNT FROM CONTINENT_COUNTRY_MAPPING c LEFT JOIN "
#     "(SELECT country_name, SUM(wine_cnt) AS c_wine_cnt FROM WINERY LEFT JOIN (SELECT WINERY_NAME, "
#     "COUNT(WINE.TITLE) AS wine_cnt FROM WINE_WINERY_MAPPING LEFT JOIN WINE ON "
#     "WINE_WINERY_MAPPING.TITLE = WINE.TITLE GROUP BY WINERY_NAME ) TEMP ON WINERY.WINERY_NAME = TEMP.WINERY_NAME"
#     " GROUP BY WINERY.COUNTRY_NAME ) x ON c.country_name = x.country_name left join "
#     "(select country_name, count(winery_name) winery_cnt from winery group by country_name) f on"
#     " c.country_name = f.country_name ORDER BY c.country_name ",
#     con, coerce_float=True)

df1 = pd.read_sql_query("select * from continent_country_view", con)

df_var = pd.read_sql_query("select VARIETY, count(*) as CNT from wine "
                           "group by variety having count(*) >200 order by cnt desc", con)

print('connected')

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

# app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

app = Flask(__name__)

Articles = Articles()


@app.route('/')
def index():
    return render_template('Overview.html')


@app.route('/Overview', methods=['GET', 'POST'])
def overviewpage():
    return render_template('Overview.html')


@app.route('/overview', methods=['GET', 'POST'])
def overviewpage_new():
    return render_template('Overview.html')


@app.route('/Taster')
def review():
    return render_template('Taster.html')


@app.route('/Search_your_Wine')
def search_page():
    winery = []
    con_prov = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                                 encoding="UTF-8",
                                 nencoding="UTF-8")
    province = []
    country = []
    winery_query = '''select distinct country_name from diva.province_cnt_view order by country_name'''

    # mycursor.execute(query1, multi=True)
    df = pd.read_sql(winery_query, con_prov)
    for index, row in df.iterrows():
        if (str(row[0]).title() not in country):
            country.append(str(row[0]).title())
    con_prov.close()
    return render_template('Search your Wine.html', country=country)


@app.route('/Know_your_wines')
def know_your_wines():
    return render_template('Know_your_wines.html')


@app.route('/world_data')
def world_data():
    country_data = []
    for index, row in df1.iterrows():
        each_data = {}
        if row['ID'] is None:
            each_data['id'] = ''
        else:
            each_data['id'] = row['ID']
        if row['COUNTRY'] is None:
            each_data['country'] = ''
        else:
            each_data['country'] = row['COUNTRY']
        if row['NO_OF_WINES'] is None:
            each_data['projects'] = 0
        else:
            each_data['projects'] = row['NO_OF_WINES']
        each_data['winery_cnt'] = row['WINERY_CNT']
        country_data.append(each_data)

    return jsonify(country_data)


@app.route("/continent_data")
def getcontinent_data():
    country_continent_data = []
    for index, row in df1.iterrows():
        each_data = {}
        if row['ID'] is None:
            each_data['country_id'] = ''
        else:
            each_data['country_id'] = row['ID']
        if row['COUNTRY'] is None:
            each_data['country'] = ''
        else:
            if row['COUNTRY'] == 'UNITED STATES OF AMERICA':
                print('caught')
            each_data['country'] = row['COUNTRY']
        if row['NO_OF_WINES'] is None or row['NO_OF_WINES'] == 'nan':
            each_data['value'] = 0
        else:
            each_data['value'] = int(row['NO_OF_WINES'])
        if row['CONTINENT'] is None:
            each_data['continent'] = ''
        else:
            each_data['continent'] = row['CONTINENT']
        each_data['winery_cnt'] = row['WINERY_CNT']
        each_data['avg_points'] = row['AVG_POINTS']
        each_data['avg_price'] = row['AVG_PRICE']
        country_continent_data.append(each_data)

    return jsonify(country_continent_data)


@app.route('/country/<country>', methods=['GET', 'POST'])
def getprovinceData(country):
    province = []
    # country = request.args.get('country')

    con_prov = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                                 encoding="UTF-8",
                                 nencoding="UTF-8")
    provincequery = '''select distinct province from diva.province_cnt_view where country_name=:name order by province'''
    df_province = pd.read_sql(provincequery, con_prov, params={'name': country.upper()})
    for index, row in df_province.iterrows():
        province.append(str(row[0]))

    con_prov.close()
    return jsonify(province)


@app.route('/province/<province>', methods=['GET', 'POST'])
def getwinerydata(province):
    winery = []
    con_prov = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                                 encoding="UTF-8",
                                 nencoding="UTF-8")
    wineryquery = '''select distinct WINERY_NAME from diva.winery where PROVINCE='?' order by winery_name'''.replace(
        '?', province)
    df_winery = pd.read_sql(wineryquery, con_prov)
    for index, row in df_winery.iterrows():
        winery.append(str(row[0]))
    con_prov.close()
    return jsonify(winery)


@app.route('/winery_details/<winery>', methods=['GET', 'POST'])
def getwinedetails(winery):
    details = {}
    con_prov = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                                 encoding="UTF-8",
                                 nencoding="UTF-8")
    winery_details_query = '''select * from winery_details_view where winery_name = :name '''

    df = pd.read_sql(winery_details_query, con_prov, params={'name': winery})

    for index, row in df.iterrows():
        details['winery_name'] = row['WINERY_NAME']
        details['avg_points'] = row['AVG_POINTS']
        details['avg_price'] = row['AVG_PRICE']
        details['wine_cnt'] = row['CNT_WINE']

    if len(details) == 0:
        details = {'avg_price': 0, 'avg_points': 80, 'wine_cnt': 0, 'winery_name': winery}

    return jsonify(details)


@app.route('/winery/<winery>', methods=['GET', 'POST'])
def getwines(winery):
    wines = []
    reviews = []
    wine = {}
    userreviews = {}
    # country = request.args.get('country')

    con_prov = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                                 encoding="UTF-8",
                                 nencoding="UTF-8")
    winesquery = '''select w.TITLE,w.POINTS,w.PRICE,w.VARIETY,wt.TASTER_NAME,t.taster_twitter,w.DESCRIPTION,r.Reviewer_Name,r.Review from wine w
    join wine_taster_mapping wt on wt.title=w.title
    join taster t on t.TASTER_NAME=wt.TASTER_NAME
    left join reviews r on r.title=w.title
    join wine_winery_mapping ww on ww.TITLE=w.TITLE
    join winery wi on wi.WINERY_NAME=ww.WINERY_NAME    
    WHERE wi.WINERY_NAME='?'
    AND w.POINTS is not null 
    and w.price is not null
    order by w.POINTS desc'''.replace('?', winery)

    df_wines = pd.read_sql(winesquery, con_prov)
    uniquewines = df_wines.TITLE.unique()

    for row in uniquewines:
        counter = 0
        reviews = []
        winerecords = df_wines.loc[df_wines["TITLE"] == row]
        if len(winerecords) == 1:
            wine = {}
            wine["Title"] = str(winerecords["TITLE"].values[0])
            wine["Points"] = str(winerecords["POINTS"].values[0])
            wine["Price"] = str(winerecords["PRICE"].values[0])
            wine["Variety"] = str(winerecords["VARIETY"].values[0])
            wine["Taster"] = str(winerecords["TASTER_NAME"].values[0])
            wine["twitter"] = str(winerecords["TASTER_TWITTER"].values[0])
            wine["Description"] = str(winerecords["DESCRIPTION"].values[0])
            if (str(winerecords["REVIEWER_NAME"].values[0]) != '' and str(
                    winerecords["REVIEWER_NAME"].values[0]) != 'None'):
                userreviews = {}
                userreviews["User"] = str(winerecords["REVIEWER_NAME"].values[0])
                userreviews["Review"] = str(winerecords["REVIEW"].values[0])
                reviews.append(userreviews)
            if len(reviews) == 0:
                wine["Reviews"] = ''
            else:
                wine["Reviews"] = reviews
            wines.append(wine)
        else:
            for index, row in winerecords.iterrows():
                if (counter == 0):
                    wine = {}
                    wine["Title"] = str(row[0])
                    wine["Points"] = str(row[1])
                    wine["Price"] = str(row[2])
                    wine["Variety"] = str(row[3])
                    wine["Taster"] = str(row[4])
                    wine["twitter"] = str(row[5])
                    wine["Description"] = str(row[6])
                if (str(row[7]) != '' and str(row[7]) != 'None'):
                    userreviews = {}
                    userreviews["User"] = str(row[7])
                    userreviews["Review"] = str(row[8])
                    reviews.append(userreviews)
                if counter == len(winerecords) - 1:
                    if len(reviews) == 0:
                        wine["Reviews"] = ''
                    else:
                        wine["Reviews"] = reviews
                    wines.append(wine);
                counter = counter + 1

    con_prov.close()
    return jsonify(wines)


@app.route("/varieties_data")
def getvarieties_data():
    varieties_data = []
    for index, row in df_var.iterrows():
        each_data = {}
        each_data['variety'] = row['VARIETY']
        each_data['count'] = row['CNT']
        varieties_data.append(each_data)

    return jsonify(varieties_data)


@app.route("/variety_data", methods=['GET', 'POST'])
def getvariety_data():
    variety = request.args.get('variety')
    variety_data = []
    df_variety = pd.read_sql_query('''select COUNTRY_NAME,count(*) as CNT from  wine b left join wine_winery_mapping a
                   on a.title = b.title left join winery c on a.winery_name = c.winery_name where b.variety = :name
                   and country_name is not null
                   group by country_name order by cnt desc''', con, params={'name': variety})
    for index, row in df_variety.iterrows():
        each_data = {}
        each_data['country_name'] = row['COUNTRY_NAME']
        each_data['count'] = row['CNT']
        variety_data.append(each_data)

    return jsonify(variety_data)


@app.route("/variety_wine_data", methods=['GET', 'POST'])
def getvariety_wine_data():
    variety_wine = request.args.get('variety')
    variety_wine_data = []
    df_variety_wine = pd.read_sql_query('''SELECT * FROM (select B.TITLE,B.PRICE,B.POINTS,ROUND((b.points/b.price),2) as wine_level from  wine b left join wine_winery_mapping a
                   on a.title = b.title left join winery c on a.winery_name = c.winery_name 
                   where b.variety = :name
                   and country_name is not null
                   and b.price is not null and b.points is not null
--                   and wine_level is not null
                   order by wine_level desc
                   ) WHERE ROWNUM < 25 ''', con_wine, params={'name': variety_wine})
    for index, row in df_variety_wine.iterrows():
        each_data = {}
        each_data['title'] = row['TITLE']
        each_data['level'] = row['WINE_LEVEL']
        each_data['price'] = row['PRICE']
        each_data['points'] = row['POINTS']
        variety_wine_data.append(each_data)

    return jsonify(variety_wine_data)


@app.route("/variety_wordcloud_data")
def getvariety_wordcloud_data():
    clouddata = []
    variety_wine = request.args.get('variety')
    df_word_cloud = pd.read_sql_query('''SELECT RTRIM(XMLAGG(XMLELEMENT(E,DESCRIPTION,',').EXTRACT('//text()') ORDER BY wine_level).GetClobVal(),',') as AGG_DESC
FROM (select B.TITLE,B.DESCRIPTION,B.PRICE,B.POINTS,ROUND((b.points/b.price),2) as wine_level from  wine b left join wine_winery_mapping a
                   on a.title = b.title left join winery c on a.winery_name = c.winery_name 
                   where b.variety = :name
                   and country_name is not null
                   and b.price is not null and b.points is not null
--                   and wine_level is not null
                   order by wine_level
                   )  WHERE ROWNUM < 1000 ''', con_wine_cloud, params={'name': variety_wine})
    for index, row in df_word_cloud.iterrows():
        each_data = {}
        text = row['AGG_DESC']
        text = text.replace("&apos", "\'")
        re.sub('[\(\[].*?[\)\]]', ' ', text)
        unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore')
        text = text.lower()
        stopword_list = stopwords.words('english')
        stopword_list.append('and')
        stopword_list.append('wine')
        word_tokens = word_tokenize(text)

        filtered_sentence = [w for w in word_tokens if not w in stopword_list]

        filtered_sentence = []

        for w in word_tokens:
            if w not in stopword_list:
                filtered_sentence.append(w)
        text = ''
        for w in filtered_sentence:
            text = text + ' ' + w
        each_data['desc'] = text
        clouddata.append(each_data)

    return jsonify(clouddata)


@app.route("/province_data", methods=['GET', 'POST'])
def getprovince_data():
    con_prov = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port,
                                 encoding="UTF-8",
                                 nencoding="UTF-8")
    country_name = request.args.get('country')
    df_prov = pd.read_sql_query("select province,country_name, p_wine_cnt, AVG_PRICE, AVG_POINTS from "
                                "province_cnt_view where country_name = :name", con_prov,
                                params={'name': country_name})
    province_data = []
    for index, row in df_prov.iterrows():
        each_data = {}
        pair = {}
        pair['name'] = row['PROVINCE']
        pair['value'] = int(row['P_WINE_CNT'])
        each_data['name'] = ''
        children = [pair]
        each_data['children'] = children
        each_data['country'] = row['COUNTRY_NAME']
        each_data['avg_price'] = row['AVG_PRICE']
        each_data['avg_points'] = row['AVG_POINTS']
        each_data['value'] = int(row['P_WINE_CNT'])
        province_data.append(each_data)
    return jsonify(province_data)


@app.route("/provincedrill_data", methods=['GET', 'POST'])
def getprovincedrill_data():
    con_prov_drill = cx_Oracle.connect(user=p_username, password=p_password,
                                       dsn=p_host + "/" + p_service + ":" + p_port,
                                       encoding="UTF-8",
                                       nencoding="UTF-8")
    country_name = request.args.get('country')
    df_prov = pd.read_sql_query('''SELECT * FROM DRILL_DOWN_VIEW WHERE COUNTRY_NAME = :name ''', con_prov_drill,
                                params={'name': country_name})

    drill_data = {}
    othercnt = 0
    for index, row in df_prov.iterrows():
        each_data = {}
        if (drill_data.get(row['PROVINCE']) is not None):
            each_data = drill_data[row['PROVINCE']]
        else:
            othercnt = 0
        child = {}
        if (drill_data.get(row['PROVINCE']) is None) or (drill_data.get(row['PROVINCE']).get('wines') is None):
            each_data['wines'] = []
        if len(each_data['wines']) < 5:
            each_data['wines'].append(child)
        else:
            othercnt = row['V_WINE_CNT'] + othercnt
            others = {}
            others['variety'] = "Others"
            others['wine_cnt'] = othercnt
            others['max_wine_level'] = row['WINE_LEVEL']
            others['v_avg_points'] = row['V_AVG_POINTS']
            others['v_avg_price'] = row['V_AVG_PRICE']
            others['v_best_wine'] = ''
            for i in range(len(each_data['wines'])):
                if each_data['wines'][i].get('variety') == "Others":
                    del each_data['wines'][i]
                    break
            each_data['wines'].append(others)
        child['variety'] = row['VARIETY']
        child['wine_cnt'] = row['V_WINE_CNT']
        child['max_wine_level'] = row['WINE_LEVEL']
        child['v_avg_points'] = row['V_AVG_POINTS']
        child['v_avg_price'] = row['V_AVG_PRICE']
        child['v_best_wine'] = row['V_TITLE']
        each_data['province'] = row['PROVINCE']
        each_data['p_wine_cnt'] = row['P_WINE_CNT']
        each_data['p_avg_price'] = row['P_AVG_PRICE']
        each_data['p_avg_points'] = row['P_AVG_POINTS']
        drill_data[row['PROVINCE']] = each_data

    return jsonify(drill_data)


def processforcetreedata(data):
    treeData = []

    for taster in data:
        tasterData = {
            'name': taster,
            'children': []
        }
        i = 0
        for variety in data[taster]['children']:
            tasterData['children'].append({
                'name': data[taster]['children'][variety]['variety'],
                'value': data[taster]['children'][variety]['wine_cnt'],
                'children': []
            })

            for title in data[taster]['children'][variety]['children']:
                tasterData['children'][i]['children'].append({
                    'name': data[taster]['children'][variety]['children'][title]['title'],
                    'value': data[taster]['children'][variety]['children'][title]['points'],
                    'pointsrank': data[taster]['children'][variety]['children'][title]['pointsrank']
                })

            i = i + 1

        treeData.append(tasterData)

    return treeData


@app.route("/directedtree_data", methods=['GET', 'POST'])
def getdirectedtree_data():
    con_dir_tree = cx_Oracle.connect(user=p_username, password=p_password,
                                     dsn=p_host + "/" + p_service + ":" + p_port,
                                     encoding="UTF-8",
                                     nencoding="UTF-8")
    df_prov = pd.read_sql_query('''SELECT * FROM TASTER_VARIETY_VIEW_TRIM''', con_dir_tree)

    drill_data = {}
    for index, row in df_prov.iterrows():
        each_data = {}
        if drill_data.get(row['TASTER_NAME']) is not None:
            each_data = drill_data[row['TASTER_NAME']]
        child = {}
        if (drill_data.get(row['TASTER_NAME']) is None) or (drill_data.get(row['TASTER_NAME']).get('children') is None):
            each_data['children'] = {}
        elif drill_data.get(row['TASTER_NAME']).get('children').get(row['VARIETY']) is not None:
            child = drill_data.get(row['TASTER_NAME']).get('children').get(row['VARIETY'])
        each_data['children'][row['VARIETY']] = child
        child['variety'] = row['VARIETY']
        child['wine_cnt'] = row['WINE_CNT']
        grandchild = {}
        if (drill_data.get(row['TASTER_NAME']) is None) or (
                drill_data.get(row['TASTER_NAME']).get('children') is None) or (
                drill_data.get(row['TASTER_NAME']).get('children').get(row['VARIETY']).get('children') is None):
            each_data['children'][row['VARIETY']]['children'] = {}
        elif drill_data.get(row['TASTER_NAME']).get('children').get(row['VARIETY']).get('children').get(
                row['TITLE']) is not None:
            grandchild = drill_data.get(row['TASTER_NAME']).get('children').get(row['VARIETY']).get('children').get(
                row['TITLE'])
        each_data['children'][row['VARIETY']]['children'][row['TITLE']] = grandchild
        grandchild['title'] = row['TITLE']
        grandchild['pointsrank'] = row['POINTSRANK']
        grandchild['points'] = row['POINTS']
        each_data['taster_name'] = row['TASTER_NAME']
        drill_data[row['TASTER_NAME']] = each_data
    drill_data = processforcetreedata(drill_data)
    return jsonify(drill_data)


@app.route("/get_wine_description", methods=['GET', 'POST'])
def get_wine_description():
    taster_name = request.args.get('taster_name')
    variety = request.args.get('variety')
    con_dir_tree = cx_Oracle.connect(user=p_username, password=p_password,
                                     dsn=p_host + "/" + p_service + ":" + p_port,
                                     encoding="UTF-8",
                                     nencoding="UTF-8")
    df_prov = pd.read_sql_query('''select * from taster_variety_view_description
WHERE taster_name = :taster
AND variety       = :variety ''', con_dir_tree, params={'taster': taster_name, 'variety': variety})

    desc_data = {}
    for index, row in df_prov.iterrows():
        each_data = {}
        each_data['desc'] = row['DESCRIPTION']
        each_data['fullname'] = row['FULLNAME']
        desc_data[row['TITLE']] = each_data

    return jsonify(desc_data)


@app.route("/userreviews/<title>/<user>/<userreview>", methods=['GET', 'POST'])
def userreviews(title, user, userreview):
    con_rev = cx_Oracle.connect(user=p_username, password=p_password,
                                dsn=p_host + "/" + p_service + ":" + p_port,
                                encoding="UTF-8",
                                nencoding="UTF-8")
    cursor = con_rev.cursor()
    user_id = user
    userquery = 'Insert into reviews ("TITLE", "REVIEWER_NAME", "REVIEW") values(:title, :user_id, :userreview)'

    cursor.execute(userquery, [title, user_id, userreview])
    con_rev.commit()
    cursor.close()

    # pd.to_sql(userquery, con=dbConnection, if_exists='append', chunksize=1000)
    selectquery = '''select * from reviews where title='?' '''.replace('?', title)
    df_review = pd.read_sql_query(selectquery, con_rev)
    winereviews = []
    wine = {}
    reviews = []
    for index, row in df_review.iterrows():
        if (index == 0):
            wine["Title"] = str(row[0])
        if str(row[1]) != '' and str(row[1]) != 'None':
            userreviews = {}
            userreviews["User"] = str(row[1])
            userreviews["Review"] = str(row[2])
            reviews.append(userreviews)
        if index == len(df_review) - 1:
            if len(reviews) == 0:
                wine["Reviews"] = ''
            else:
                wine["Reviews"] = reviews
            winereviews.append(wine);
    con_rev.close()
    return jsonify(winereviews)


@app.route('/Recommender', methods=['GET', 'POST'])
def recommender():
    review = ' '
    v1 = "Selected Variety"
    x = "Select Country"
    v = []
    z = " "
    x0 = None
    x1 = None
    x2 = None
    x3 = None
    x4 = None
    x5 = None
    x6 = None
    s1 = 0
    s2 = 0
    s3 = 0
    s4 = 0
    s5 = 0
    s6 = 0
    s0 = 0
    t = []
    o = []
    k = []
    r = []
    f = []
    j = []
    h = []
    t1 = None
    t0 = None
    t2 = None
    o1 = None
    o2 = None
    o3 = None
    k1 = None
    k2 = None
    k3 = None
    r1 = None
    r2 = None
    r3 = None
    y1 = None
    y2 = None
    y3 = None
    j1 = None
    j2 = None
    j3 = None
    h1 = None
    h2 = None
    h3 = None

    # country_name = request.args.get('country')
    # print(country_name)

    if request.method == 'POST' :
        x = request.form.get('country')
        y = request.form.get('variety')
        print(x, y)
        if x is not None:
            data = pd.read_csv("D:/Study/DIVA/wine-reviews/winemag-data-130k-v2.csv")
            data = data.filter(items=['country', 'variety', 'description'])
            country = data.groupby('country').filter(lambda x: len(x) > 1000)
            filtered = country.groupby('variety').filter(lambda x: len(x) > 1000)

            def mineText(data, x, y):
                N = 900
                true_choice_Variety = y
                true_choice_Country = x

                # print("You're drinking a {} from {}".format(true_choice_Variety, true_choice_Country))

                minedText = data[(data["country"] == true_choice_Country) & (data["variety"] == true_choice_Variety)][
                    'description']

                if len(minedText) < N:
                    moreText = data[(data["country"] == true_choice_Country) ^ (data["variety"] == true_choice_Variety)][
                        'description']
                    minedText = pd.concat([minedText, moreText.sample(n=N - len(minedText))], axis=0)

                return minedText.str.cat(sep=' ')

            def randoms(tokens):

                steps = {}
                for k in range(len(tokens) - 1):
                    token = tokens[k]
                    if token in steps:
                        steps[token].append(tokens[k + 1])
                    else:
                        steps[token] = [tokens[k + 1]]
                return steps

            def randomw(steps):
                words = [w for w in list(steps) if w.isalpha()]
                token = choice(words)
                w = token.capitalize()
                numtokens = 1
                while True:
                    token = choice(steps[token])

                    if match('[?.!]', token):
                        w += token

                        if numtokens > 50:
                            break

                        token = choice(words)
                        w += ' ' + token.capitalize()

                    elif match('[,;:%]', token):
                        w += token
                    else:
                        w += ' ' + token
                    numtokens += 1
                return w

            minedText = mineText(filtered, x, y)
            tokens = word_tokenize(minedText)
            steps = randoms(tokens)
            review = randomw(steps)
            print(review)
            v2 = x
            data2 = pd.read_csv("D:/Study/DIVA/wine-reviews/winemag-data-130k-v2.csv")

            w = data2.copy()
            col = ['province', 'variety', 'price']
            w = data2[col]

            w = w.dropna(axis=0)
            w = w.drop_duplicates(['province', 'variety'])
            # wine1 = wine1[wine1['points'] >75]
            w_p = w.pivot(index='variety', columns='province', values='price').fillna(0)
            # print(wine_pivot)
            w_p_m = csr_matrix(w_p)
            # print(wine_pivot_matrix)
            knn = NearestNeighbors(n_neighbors=10, algorithm='brute', metric='cosine')
            model_knn = knn.fit(w_p_m)
            # user_input = input("Enter Variety")

            map1 = {}
            for i in range(len(w_p)):
                map1[w_p.index[i]] = i
            loc = 0
            query_index = None
            for l in map1:
                if l == y:
                    loc = map1[l]
                query_index = loc
            print(query_index)

            distance, indice = model_knn.kneighbors(w_p.iloc[query_index, :].values.reshape(1, -1), n_neighbors=8)
            # print(distance)
            # print(distance.flatten())

            for i in range(0, len(distance.flatten())):
                if i == 0:
                    print('Your Choice for {0}:\n'.format(w_p.index[query_index]))
                    v1 = w_p.index[indice.flatten()[i]]
                else:
                    print('{0}: {1} with distance: {2}'.format(i, w_p.index[indice.flatten()[i]], distance.flatten()[i]))

                    v.append(w_p.index[indice.flatten()[i]])
            df1 = pd.read_csv("D:/Study/DIVA/wine-reviews/winemag-data-130k-v2.csv")
            # df1 = data3[data3['variety'] == v[1]].drop(
            #  columns=["country", "description", "province", "designation", "taster_name", "region_1", "region_2",
            # "taster_twitter_handle"])
            l0 = df1.loc[df1['variety'] == v[0], 'price'].sum()
            l00 = df1.loc[df1['variety'] == v[0], 'points'].sum()
            l1 = df1.loc[df1['variety'] == v[1], 'price'].sum()
            l11 = df1.loc[df1['variety'] == v[1], 'points'].sum()
            l2 = df1.loc[df1['variety'] == v[2], 'price'].sum()
            l22 = df1.loc[df1['variety'] == v[2], 'points'].sum()
            l3 = df1.loc[df1['variety'] == v[3], 'price'].sum()
            l33 = df1.loc[df1['variety'] == v[3], 'points'].sum()
            l4 = df1.loc[df1['variety'] == v[4], 'price'].sum()
            l44 = df1.loc[df1['variety'] == v[4], 'points'].sum()
            l5 = df1.loc[df1['variety'] == v[5], 'price'].sum()
            l55 = df1.loc[df1['variety'] == v[5], 'points'].sum()
            l6 = df1.loc[df1['variety'] == v[6], 'price'].sum()
            l66 = df1.loc[df1['variety'] == v[6], 'points'].sum()
            s0 = l0 / l00
            s1 = l1 / l11
            s2 = l2 / l22
            s3 = l3 / l33
            s4 = l4 / l44
            s5 = l5 / l55
            s6 = l6 / l66
            x0 = v[0]
            x1 = v[1]
            x3 = v[2]
            x2 = v[3]
            x4 = v[4]
            x5 = v[5]
            x6 = v[6]

            n1 = df1.loc[(df1['variety'] == v[0]) & (df1['points'] > 75), 'title'].head()
            for items in n1:
                t.append(items)
            t0 = t[0]
            t1 = t[1]
            t2 = t[2]
            n2 = df1.loc[(df1['variety'] == v[1]) & (df1['points'] > 75), 'title'].head()
            for items in n2:
                o.append(items)
            o1 = o[0]
            o2 = o[1]
            o3 = o[2]
            n3 = df1.loc[(df1['variety'] == v[2]) & (df1['points'] > 75), 'title'].head()
            for items in n3:
                k.append(items)
            k1 = k[0]
            k2 = k[1]
            k3 = k[2]
            n4 = df1.loc[(df1['variety'] == v[3]) & (df1['points'] > 75), 'title'].head()
            for items in n4:
                r.append(items)
            r1 = r[0]
            r2 = r[1]
            r3 = r[2]

            n5 = df1.loc[(df1['variety'] == v[4]) & (df1['points'] > 75), 'title'].head()
            for items in n5:
                f.append(items)
            y1 = f[0]
            y2 = f[1]
            y3 = f[2]
            n6 = df1.loc[(df1['variety'] == v[5]) & (df1['points'] > 75), 'title'].head()
            for items in n6:
                h.append(items)
            h1 = h[0]
            h2 = h[1]
            h3 = h[2]
            n7 = df1.loc[(df1['variety'] == v[6]) & (df1['points'] > 75), 'title'].head()
            for items in n7:
                j.append(items)
            j1 = j[0]
            j2 = j[1]
            j3 = j[2]

    return render_template('Recommender.html', z=review, list=v, user_var=v1, country=x, x0=x0, x1=x1, x2=x2, x3=x3,
                           x4=x4,
                           x5=x5, x6=x6, s0=s0 * 1000, s1=s1 * 1000, s2=s2 * 1000, s3=s3 * 1000, s4=s4 * 1000,
                           s5=s5 * 1000,
                           s6=s6 * 1000, t0=t0, t1=t1, t2=t2, o1=o1, o2=o2, o3=o3, k1=k1, k2=k2, k3=k3, r1=r1, r2=r2,
                           r3=r3, y1=y1, y2=y2
                           , y3=y3, h1=h1, h2=h2, h3=h3, j1=j1, j2=j2, j3=j3)


@app.route("/winelevel_data", methods=['GET', 'POST'])
def winelevel_data():
    continent = request.args.get('continent')

    querywine = '''select round((sum(w.points)/sum(w.price)),2) as winelevel, wi.COUNTRY_NAME,round(avg(points),2) as points, round(avg(price),2) as price, max(ccm.three_letter_country_code)
from wine w inner join wine_winery_mapping wm on  w.title=wm.title
inner join winery wi on wi.WINERY_NAME=wm.WINERY_NAME
inner join continent_country_mapping ccm on wi.COUNTRY_NAME= ccm.COUNTRY_NAME
where ccm.CONTINENT_NAME= :name 
and w.price is not null and w.points is not null
group by wi.COUNTRY_NAME 
order by wi.COUNTRY_NAME   '''

    df_wine = pd.read_sql_query(querywine.replace("?", continent), con_wine, params={'name': continent})
    bar_data = []
    for index, row in df_wine.iterrows():
        each_data = {}
        pair = {}
        pair['Country_Code'] = row[4]
        pair['Wine Level'] = str(row[0])
        # each_data['value'] = int(row['P_WINE_CNT'])
        children = [pair]
        each_data['Country_Code'] = row[4]
        each_data['Points'] = row[2]
        each_data['Price'] = row[3]
        each_data['Country'] = row[1]
        each_data['Wine_Level'] = str(row[0])
        bar_data.append(each_data)
    return jsonify(bar_data)


@app.route('/getPlotData')
def getPlotData():
    scatter_data = []
    for index, row in df.iterrows():
        each_data = {}
        each_data['INDEXCOL'] = row['INDEXCOL']
        each_data['POINTS'] = row['POINTS']

        scatter_data.append(each_data)

    return jsonify(scatter_data)


@app.route('/Aboutus')
def Aboutus():
    return render_template('Aboutus.html')


@app.route('/articles')
def articles():
    return render_template('articles.html', articles=Articles)


@app.route('/article/<string:id>/')
def article(id):
    return render_template('article.html', id=id)


if __name__ == '__main__':
    app.run(debug=True)
