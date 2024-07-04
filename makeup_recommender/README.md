# Dissertation
in views.py in mkaeup_api folder change path to correct path for loading ingredient aliases in data folder within the makeup_api folder (line 29)


if changing database run this
python manage.py import_products /Users/ambertong/Documents/GitHub/Dissertation/makeup_recommender_copy/Modified_Cosmetic_Brand_Products_Dataset-2.csv
then run
python manage.py makemigrations and python manage.py migrate

open makeup_recommender folder in vs code
run python manage.py runserver in the terminal (make sure you're in makeup_recommender directory)
open new terminal and go to makeup_frontend directory by typing cd makeup_frontend
run npm start

# Dissertation

## Overview
This project is a Django application with a React frontend designed to provide personalized makeup recommendations and virtual try-on experiences. It utilizes machine learning algorithms for product recommendation and real-time facial landmark detection for virtual try-on features.

## Setup Instructions
1. **Open the makeup_recommender folder in Visual Studio Code**

2. **Install Dependencies:**
- Navigate to the root directory of the project.
- Install Python dependencies:
  ```
  pip install -r requirements.txt
  ```
- Install Node.js dependencies for the frontend:
  ```
  cd makeup_frontend
  npm install
  ```

3. **Database Setup:**
- If changing the database, update the path for loading ingredient aliases in `views.py` in the `makeup_api` folder.
- Run the following commands to import products and migrate the database:
  ```
  python manage.py import_products /path/to/Modified_Cosmetic_Brand_Products_Dataset-2.csv
  python manage.py makemigrations
  python manage.py migrate
  ```

4. **Run the Application:**
- Open the `makeup_recommender` folder in your preferred code editor.
- Start the Django server:
  ```
  python manage.py runserver
  ```
- Open a new terminal and navigate to the `makeup_frontend` directory:
  ```
  cd makeup_frontend
  ```
- Start the React development server:
  ```
  npm start
  ```

5. **Access the Application:**
- Once both the Django and React servers are running, visit `http://localhost:3000` in your web browser to access the application.

## Additional Imports
This project also utilizes the following imports:
- `os`
- `django.shortcuts.render`
- `logging`
- `nltk`
- `sklearn.feature_extraction.text.TfidfVectorizer`
- `sklearn.metrics.pairwise.cosine_similarity`
- `nltk.tokenize.word_tokenize`
- `collections.defaultdict`
- `rest_framework.views.APIView`
- `rest_framework.response.Response`
- `rest_framework.status`
- `makeup_api.models.Product`
- `makeup_api.serializers.ProductSerializer`
- `django.db.models.Q`
- `get_object_or_404`
- `json`
- `django.conf.settings`
- `django.http.JsonResponse`
- `math`
- `django.urls.path`
- `makeup_frontend.views`
- `rest_framework.serializers`
- `makeup_frontend.models.Product`
- `@tensorflow/tfjs`
- `@vladmandic/face-api`
- `makeupUtils.updateMakeupOverlays`
- `axios`
- `React.useState`
- `React.useEffect`
- `React.useRef`
- `React.useCallback`
- `React.useState`
- `SearchBar`
- `WebcamStream`

Ensure that all necessary dependencies are installed before running the application.