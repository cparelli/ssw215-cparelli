# Sprint 1 - Creation of the Art Portfolio Website

# Project Overview/ Recap
For my project, I am creating an art portfolio website for my mother, Paulina Olivares. The goal is to allow her to easily upload and manage ehr artwork and display it in a public online gallery, where others can view it. I plan to include a feature that helps her generate descriptions for her artwork, which she can review and edit before saving. 

# Workflow Demo Guide
1. Open the ArtPortfolioProject folder in VS Code.
2. Open the terminal and run py -m http.server 8000 --bind 127.0.0.1 to start the local server.
3. Go to http://127.0.0.1:8000/index.html in a browser to view the public gallery.
4. Use the category filter to look at different types of artwork.
5. Go to the artist page to upload a new artwork by entering its information and selecting an image.
6. Click Generate Description to create a sample description, which can be edited before saving.
7. Save the artwork and check that it appears in the public gallery.
8. Return to the artist page to edit or delete the artwork.

# AI Usage Log & Reflection 
I used ChatGPT and the GitHub Copilot assistant in VS Code to help troubleshoot parts of my HTML, CSS, and JavaScript that I was having issues with. From GitHub Copilot, I asked for help creating the artwork upload form, updating the gallery, and adding features to edit and delete artwork. I reviewed the code and tested the website as I went because some of the suggested changes did not work correctly at first.

One issue I ran into was getting the artwork to save and update between both pages, and another was getting the JSON file to load when opening the HTML files directly. I fixed these issues by updating the JavaScript and running the website through a local Python server. Overall, using these tools helped me better understand how the different files work together and how JavaScript makes the website interactive.