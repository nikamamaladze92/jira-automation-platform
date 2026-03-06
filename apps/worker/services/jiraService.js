// apps/worker/services/jiraService.js
const axios = require("axios");

function getRequiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const baseUrl = getRequiredEnv("JIRA_BASE_URL").replace(/\/$/, "");
const email = getRequiredEnv("JIRA_EMAIL");
const token = getRequiredEnv("JIRA_API_TOKEN");

// ✅ This is the axios client (name it jiraClient so we never confuse it)
const jiraClient = axios.create({
  baseURL: `${baseUrl}/rest/api/3`,
  auth: {
    username: email,
    password: token,
  },
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

exports.addComment = async (issueKey, comment) => {
  // ADF format required by Jira Cloud
  const res = await jiraClient.post(`/issue/${issueKey}/comment`, {
    body: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: comment }],
        },
      ],
    },
  });

  return res.data;
};

exports.assignIssue = async (issueKey, accountId) => {
  const res = await jiraClient.put(`/issue/${issueKey}/assignee`, {
    accountId,
  });
  return res.data;
};

exports.transitionIssue = async (issueKey, transitionId) => {
  const res = await jiraClient.post(`/issue/${issueKey}/transitions`, {
    transition: { id: transitionId },
  });
  return res.data;
};

exports.updateField = async (issueKey, fields) => {
  const res = await jiraClient.put(`/issue/${issueKey}`, { fields });
  return res.data;
};
