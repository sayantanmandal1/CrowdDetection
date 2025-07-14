import pandas as pd
from prophet import Prophet
import random
import datetime

# Simulate historical crowd data
def generate_dummy_data(location_id):
    base = datetime.datetime.now() - datetime.timedelta(days=30)
    data = []
    for i in range(30 * 24):  # 30 days hourly data
        ts = base + datetime.timedelta(hours=i)
        count = random.randint(30, 200) + (i % 24) * 5  # Simulate peak around evening
        data.append([ts, count])
    df = pd.DataFrame(data, columns=["ds", "y"])
    return df

def forecast_crowd_density(location_id, hours_ahead):
    df = generate_dummy_data(location_id)
    model = Prophet(daily_seasonality=True)
    model.fit(df)

    future = model.make_future_dataframe(periods=hours_ahead, freq='H')
    forecast = model.predict(future)

    # Filter only future predictions
    result = forecast.tail(hours_ahead)[['ds', 'yhat']].to_dict(orient='records')
    return {"location_id": location_id, "forecast": result} 