import dash
from flask import Flask
import dash_table_experiments as dt
from dash.dependencies import Input, Output
import dash_core_components as dcc
import dash_html_components as html
import pandas as pd
df = pd.DataFrame({'number':[i for i in range(100000)],'value':[str(i)+'_value' for i in range(100000)],'value1':[str(i)+'_value1' for i in range(100000)]})
app = dash.Dash(__name__)
app.scripts.config.serve_locally = True
app.layout = html.Div([html.H4('Fake Table'),
    html.Div([html.P('Search a number (up to 100,000):  ', style={'display':'inline-block'}), dcc.Input(type='text', value='', id='input1'),
    html.Button('SORT',id='input2')], style={'display':'inline-block'}),
    dt.DataTable(
        rows=df.head(100).to_dict('records'),
        columns=sorted(df.columns),
        filterable=False,
        sortable=True,
        selected_row_indices=[],
        id='datatable'
    )])
def filter(val, clicks):
    """
    For user selections, return the relevant in-memory data frame.
    """
    if clicks:
        if clicks % 2 == 1:
            df.sort_values('number', ascending=False, inplace=True)
        else:
            df.sort_values('number', ascending=True, inplace=True)
    return df.loc[df.number.astype(str).str.contains(val)]
@app.callback(Output('datatable','rows'),[Input('input1', 'value'), Input('input2', 'n_clicks')])
def update(val, clicks):
    df = filter(val, clicks)
    return df.head(100).to_dict('records')



if __name__ == "__main__":
    app.run_server(debug=True)