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


@app.route('/Search_your_Wine')
def search_page():
    return render_template('Search your Wine.html')


@app.route('/Know_your_wines')
def know_your_wines():
    return render_template('Know_your_wines.html')


@app.route('/Recommender', methods=['GET', 'POST'])
def recommender():
    review = ' '
    v1 = "Select Province"
    x = "Select Country"
    v = []
    z = " "
    vari = []
    # country_name = request.args.get('country')
    # print(country_name)

    if request.method == 'POST':
        x = 'Germany'
        y = 'White Blend'
        x = request.form.get('country')
        y = request.form.get('variety')
        print(x, y)

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
    return render_template('Recommender.html', z=review, list=v, user_var=v1, country=x)


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
