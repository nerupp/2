## Section 6: Supabase Object Store
Supabase is an open-source Firebase alternative that provides developers with a complete backend-as-a-service platform centered around PostgreSQL, a powerful relational database system offering full SQL capabilities, real-time subscriptions, and robust extensions for scalable data management. Its object storage is an S3-compatible service designed for storing and serving files like images, videos, and user-generated content.

Website: https://supabase.com/

**Requirements**:
- Build a document upload and file management system powered by Supabase. The backend will include API endpoints to interact with Supabse.
- **Note:** The detailed requirement will be discussed in week 4 lecture.
- Make regular commits to the repository and push the update to Github.
- Capture and paste the screenshots of your steps during development and how you test the app. Show a screenshot of the documents stored in your Supabase Object Database.

Test the app in your local development environment, then deploy the app to Vercel and ensure all functionality works as expected in the deployed environment.

**Steps with major screenshots:**
<img width="1131" height="803" alt="image" src="https://github.com/user-attachments/assets/9955f478-7393-4796-8f6f-a336392f90a7" />
build a project to get project url and key
<img width="483" height="540" alt="image" src="https://github.com/user-attachments/assets/2bd03740-a89a-4300-a530-d26ca019fc7f" />

SUPABASE_URL=https://midhrcxzrpmxuyjpwvje.supabase.co
SUPABASE_ANON_KEY=sb_publishable_PxPEXLT6tSRFstCLEENOig_rA62tIDS

Create a bucket for storage the files
<img width="762" height="368" alt="image" src="https://github.com/user-attachments/assets/e76548f6-7ae5-4c82-b58e-1395eb2713cc" />

> [your steps and screenshots go here]

## Section 7: AI Summary for documents
**Requirements:**  
- **Note:** The detailed requirement will be discussed in week 4 lecture.
- Make regular commits to the repository and push the update to Github.
- Capture and paste the screenshots of your steps during development and how you test the app.
- The app should be mobile-friendly and have a responsive design.
- **Important:** You should securely handlle your API keys when pushing your code to GitHub and deploying your app to the production.
- When testing your app, try to explore some tricky and edge test cases that AI may miss. AI can help generate basic test cases, but it's the human expertise to  to think of the edge and tricky test cases that AI cannot be replace. 

Test the app in your local development environment, then deploy the app to Vercel and ensure all functionality works as expected in the deployed environment. 


**Steps with major screenshots:**
Get the ai modle from github tokens

<img width="1054" height="404" alt="image" src="https://github.com/user-attachments/assets/d06abd9f-5db6-4aa3-b329-d9618b8efba6" />

GITHUB_MODEL_ENDPOINT=https://models.github.ai/inference GITHUB_TOKEN=github_pat_11B5Z5K4Y0KY97HMbYVMCf_O4Xhz5S1WJ5sxHgzggR5DBwOZW54ylVMV Use ai to finished the summarize

> [your steps and screenshots go here]

<img width="1137" height="665" alt="image" src="https://github.com/user-attachments/assets/dc9afed7-7d25-4782-8195-061c4edecdb7" />


## Section 8: Database Integration with Supabase  
**Requirements:**  
- Enhance the app to integrate with the Postgres database in Supabase to store the information about the documents and the AI generated summary.
- Make regular commits to the repository and push the update to Github.
- Capture and paste the screenshots of your steps during development and how you test the app.. Show a screenshot of the data stored in your Supabase Postgres Database.

Test the app in your local development environment, then deploy the app to Vercel and ensure all functionality works as expected in the deployed environment.

**Steps with major screenshots:**
After create the summary route.ts
<img width="1289" height="451" alt="image" src="https://github.com/user-attachments/assets/2e6bd11d-bcce-459e-b2a6-4ff913c9bae0" />
have the function of summary 
<img width="959" height="687" alt="image" src="https://github.com/user-attachments/assets/c983b945-f61f-4c45-9569-de7f583434bc" />
All the summary storage in the bucket of supabase
<img width="1323" height="702" alt="image" src="https://github.com/user-attachments/assets/f6bf279f-498a-484d-be8c-a223a0b4193f" />

> [your steps and screenshots go here]


## Section 9: Additional Features [OPTIONAL]
Implement at least one additional features that you think is useful that can better differentiate your app from others. Describe the feature that you have implemented and provide a screenshot of your app with the new feature.

> [Description of your additional features with screenshot goes here]
> Created a function of ai translate in the api/translate/route.ts
> <img width="1282" height="488" alt="image" src="https://github.com/user-attachments/assets/2bd1d750-8be0-465a-9626-55de67f2d57d" />
 show like this in the app 
<img width="955" height="814" alt="image" src="https://github.com/user-attachments/assets/24c298f8-d409-47ae-b0eb-19c66c2e7d85" />
there are 6 language for user to translate

and the delet function shows in the rubish bin symbol
<img width="356" height="188" alt="image" src="https://github.com/user-attachments/assets/0ec3c390-0259-4180-881e-d6774013c275" />

