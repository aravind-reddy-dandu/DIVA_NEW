import dash
import dash_core_components as dcc
import dash_html_components as html
import pandas as pd
import cx_Oracle
import plotly.graph_objs as go

p_username = "DIVA"
p_password = "DIVA"
p_host = "localhost"
p_service = "orclpdb.myfiosgateway.com"
p_port = "1521"
con = cx_Oracle.connect(user=p_username, password=p_password, dsn=p_host + "/" + p_service + ":" + p_port)

df = pd.read_sql_query("select ROWNUM AS INDEXCOL,PRICE,POINTS,TITLE FROM WINE", con)
# df = pd.read_csv("D:/Study/DIVA/wine-reviews/export.csv")
print('connected')

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

# df = pd.read_csv('https://gist.githubusercontent.com/chriddyp/5d1ea79569ed194d432e56108a04d188/raw/a9f9e8076b837d541398e999dcbac2b2826a81f8/gdp-life-exp-2007.csv')

fig = go.Figure(go.Scatter(x=df['INDEXCOL'], y=df['POINTS'],
                           name='DIVA CSV Plot', text=(str(df['PRICE'])+','+str(df['TITLE']))))
fig.update_layout(
    title="Wine Ratings",
    xaxis_title="Wine",
    yaxis_title="Points",
    xaxis_rangeslider_visible=True,
    font=dict(
        family="Courier New, monospace",
        size=18,
        color="#7f7f7f"
    )
)
app.layout = html.Div(
    [
        dcc.Graph(
            id='example-graph-2',
            figure=fig
        )
    ]
)

# app.layout = html.Div([
#     dcc.Graph(
#         id='life-exp-vs-gdp',
#         figure={
#             'data': [
#                 dict(
#                     x=df['INDEXCOL'],
#                     y=df['POINTS'],
#                     # text=df['TITLE'],
#                     mode='markers',
#                     opacity=0.7,
#                     marker={
#                         'size': 15,
#                         'line': {'width': 0.5, 'color': 'white'}
#                     },
#                     name=i
#                 ) for i in df.INDEXCOL.unique()
#             ],
#             'layout': dict(
#                 xaxis={'type': 'linear', 'title': 'WINE'},
#                 yaxis={'title': 'POINTS'},
#                 margin={'l': 40, 'b': 40, 't': 10, 'r': 10},
#                 legend={'x': 0, 'y': 1},
#                 hovermode='closest'
#             )
#         }
#     )
# ])

if __name__ == '__main__':
    app.run_server(debug=True)
