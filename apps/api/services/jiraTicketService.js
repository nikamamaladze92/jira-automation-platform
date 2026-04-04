//  create jira tickets from dashboard

const axios = require("axios");

const jiraClient = axios.create({
  baseURL: `${process.env.JIRA_BASE_URL}/rest/api/3`,
  auth: {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN,
  },
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

exports.createIssue = async ({
  projectKey,
  summary,
  description,
  issueType = "Task",
  priority,
}) => {
  const body = {
    fields: {
      project: {
        key: projectKey,
      },
      summary,
      issuetype: {
        name: issueType,
      },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: description || "",
              },
            ],
          },
        ],
      },
    },
  };

  if (priority) {
    body.fields.priority = {
      name: priority,
    };
  }
  try {
    const response = await jiraClient.post("/issue", body);
    return response.data;
  } catch (err) {
    console.error("Jira request failed");
    console.error("Request body:", JSON.stringify(body, null, 2));

    if (err.response) {
      console.error("Jira status:", err.response.status);
      console.error(
        "Jira response:",
        JSON.stringify(err.response.data, null, 2),
      );
    } else {
      console.error(err.message);
    }

    throw err;
  }
  //   const response = await jiraClient.post("/issue", body);
  //   return response.data;
};
