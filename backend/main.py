from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.predict import router as predict_router
from api.route import router as route_router
from api.feedback import router as feedback_router

app = FastAPI(title="AI Predictive Traffic Navigation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(predict_router, prefix="/api/predict", tags=["Prediction"])
app.include_router(route_router, prefix="/api/route", tags=["Routing"])
app.include_router(feedback_router, prefix="/api/feedback", tags=["Feedback"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Predictive Traffic Navigation API"}
