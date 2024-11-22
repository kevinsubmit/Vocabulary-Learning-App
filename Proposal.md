# Project Proposal

## Project Choice 

- [ ] Vocabulary Learning App

## Project Description 

An English Vocabulary Learning App is designed to help users expand and improve their English vocabulary in an engaging and effective way

**Initial Landing View**

![image]()

**Results View**

![image]()

## User Stories

#### MVP Goals

- As a user, you have the functions to register, log in, and log out.
- As a user, you can search for the meaning of unfamiliar words.
- As a user, you can add unfamiliar words to your personal wordbooks.
- As a user, you can remove words from your wordbooks.
- As a user, you can customize or delete the types of wordbooks, such as Medical, Architecture, Computing, Daily, or Unfamiliar, etc.
- As a user, you can modify the category of a word.

#### Stretch Goals

- As a user, you can see how many users have bookmarked the word

## Data modeling and ERD

![image](https://github.com/kevinsubmit/Vocabulary-Learning-App/blob/main/utils/imgs/erd.png)

## RESTful routes for managing data

|  Action    |             Route                                  | HTTP Verb  | 
|------------|----------------------------------------------------|------------|
|  Register  |   ‘/register’                                      |    GET     |  
|  Register  |   ‘/auth/register’                                 |    POST    |
|  Login     |   ‘/login’                                         |    GET     |  
|  Login     |   ‘/auth/register’                                 |    POST    |  
|  Logout    |   ‘/login’                                         |    GET     | 
|  Logout    |   ‘/auth/logout'                                   |    POST    | 
 

|  Action    |             Route              | HTTP Verb|
|------------|--------------------------------|----------|
|  Index     |   ‘/wordbooks’                 |  GET     |
|  New       |   ‘/wordbooks/new’             |  GET     |
|  Create    |   ‘/wordbooks’                 |  POST    |    
|  Show      |   ‘/wordbooks/:wordbookId'     |  GET     |            
|  Edit      |   ‘/wordbooks/:wordbookId/edit’|  GET     |  
|  Update    |   ‘/wordbooks/:wordbookId’     |  PUT     |                       
|  Delete    |   ‘/wordbooks/:wordbookId’     |  DELETE  |  


|  Action    |             Route                                  | HTTP Verb  |           Note  |
|------------|----------------------------------------------------|------------|-----------------|
|  Search    |   ‘/words’                           |  POST(api) |  (这个页面不带收藏标志的)         |
|  Collect   |   ‘/words/:wordbookId'               |  POST      |  (这个时候往数据库生成这个wordId) |
|  Collect   |   ‘/words/:wordId'                   |  GET       |  (这个页面是带收藏标志的)         |
|  Remove    |   ‘/words/:wordId/wordbookId/remove’ |  DELETE    |                               |



#### Notionboard Template
Notionboard template for building projects ( You can use this for any project )
https://www.notion.so/GA-Unit-3-Tunr-Lab-da2c82fafd4e4a7aa654676732db9ee3

#### Timeline - Daily Accountability
Example of a Timeline to keep organized and on task for hitting goals every single day you’re on the sprint for your project.

Create your own table using this markdown table generator website:
https://www.tablesgenerator.com/markdown_tables

Do not neglect to plan, you will thank yourself later for being proactive!

| Day        |   | Task                               | Blockers | Notes/ Thoughts |
|------------|---|------------------------------------|----------|-----------------|
| Thursday   |   | Think and Create proposal          |          |about application|
| Friday     |   | Finish proposal                    |          |create template  |
| Monday     |   | Implement the backend schema       |          |js variablles    |
| Tuesday    |   | Finish static webpages             |          |main  webpages   |
| Wesnesday  |   | Continue writing  static webpages  |          |                 |
| Thursday   |   | Finish defining cons vars funs     |          |                 |
| Friday     |   | Install the main framework         |          |                 |
| Monday     |   | Writing main logic                 |          |                 |
| Tuesday    |   | Testing the program myself         |          |cheak again      |










