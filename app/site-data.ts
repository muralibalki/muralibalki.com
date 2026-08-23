export const posts = [
  { part: 1, slug: "agents-as-information-processing-systems", title: "Agents as information-processing systems", status: "Overview", summary: "A systems view of agents: stateful, repeated-use products built around a stochastic planner." },
  { part: 2, slug: "four-views-beyond-the-model", title: "Four views beyond the model", status: "Talk review", summary: "Vyas Sekar, Arvind Narayanan, Matei Zaharia, and Omar Khattab on the machinery around AI." },
  { part: 3, slug: "the-model-is-not-the-product", title: "The model is not the product", status: "Claim 01", summary: "Product behavior lives in the harness: context, tools, constraints, checks, and user experience." },
  { part: 4, slug: "the-harness-is-a-control-loop", title: "The harness is a control loop", status: "Claim 02", summary: "Prediction, action, observation, and correction operate at different time scales." },
  { part: 5, slug: "verification-can-be-easier-than-generation", title: "Verification can be easier than generation", status: "Claim 03", summary: "You cannot prompt for every failure in a large generative space. Independent checks give us another path." },
  { part: 6, slug: "reliability-needs-an-independent-watchman", title: "Reliability needs an independent watchman", status: "Claim 04", summary: "Separating generation from verification clarifies authority, permissions, fallbacks, and recovery." },
  { part: 7, slug: "toward-declarative-agent-systems", title: "Toward declarative agent systems", status: "Future work", summary: "A research agenda for context graphs, declarative guarantees, bounded domains, and feedback-driven agents." },
];

export const recentPapers = [
  { year: "2026", venue: "AAAI", title: "Probabilistic Hash Embeddings for Online Learning of Categorical Features", authors: "Aodong Li, Abishek Sankararaman, Balakrishnan Murali Narayanaswamy", href: "https://sites.google.com/site/muralibalki/research" },
  { year: "2025", venue: "EMNLP", title: "FairGen: Controlling Sensitive Attributes for Fair Generations in Diffusion Models via Adaptive Latent Guidance", authors: "Mintong Kang, Vinayshekhar Bannihatti Kumar, Shamik Roy, et al.", href: "https://sites.google.com/site/muralibalki/research" },
  { year: "2025", venue: "NeurIPS", title: "SQLens: An End-to-End Framework for Error Detection and Correction in Text-to-SQL", authors: "Yue Gong, Chuan Lei, Xiao Qin, Kapil Vaidya, Balakrishnan Narayanaswamy, Tim Kraska", href: "https://arxiv.org/abs/2506.04494" },
  { year: "2025", venue: "VLDB", title: "Improving DBMS Scheduling Decisions with Fine-grained Performance Prediction on Concurrent Queries", authors: "Ziniu Wu, Markos Markakis, Chunwei Liu, Peter Baile Chen, et al.", href: "https://arxiv.org/abs/2501.16256" },
  { year: "2024", venue: "SoCC", title: "Vista: Machine Learning Based Database Performance Troubleshooting Framework in Amazon RDS", authors: "Vikramank Singh, Zhao Song, Balakrishnan Narayanaswamy, Kapil Vaidya, Tim Kraska", href: "https://www.amazon.science/author/balakrishnan-murali-narayanaswamy" },
  { year: "2024", venue: "SoCC", title: "Forecasting Algorithms for Intelligent Resource Scaling: An Experimental Analysis", authors: "Yanlei Diao, Dominik Horn, Andreas Kipf, Oleksandr Shchur, et al.", href: "https://sites.google.com/site/muralibalki/research" },
  { year: "2024", venue: "VLDB", title: "Why TPC is not enough: An analysis of the Amazon Redshift fleet", authors: "Alexander van Renen, Dominik Horn, Pascal Pfeil, Kapil Vaidya, et al.", href: "https://sites.google.com/site/muralibalki/research" },
  { year: "2024", venue: "ICML", title: "Online Adaptive Anomaly Thresholding with Confidence Sequences", authors: "Sophia Huiwen Sun, Abishek Sankararaman, Balakrishnan Narayanaswamy", href: "https://www.amazon.science/publications/online-adaptive-anomaly-thresholding-with-confidence-sequences" },
  { year: "2024", venue: "SIGMOD", title: "Intelligent Scaling in Amazon Redshift", authors: "Vikram Nathan, Vikramank Singh, Zhengchun Liu, et al.", href: "https://www.amazon.science/publications/intelligent-scaling-in-amazon-redshift" },
  { year: "2024", venue: "SIGMOD", title: "Stage: Query Execution Time Prediction in Amazon Redshift", authors: "Ziniu Wu, Ryan Marcus, Zhengchun Liu, et al.", href: "https://www.amazon.science/publications/stage-query-execution-time-prediction-in-amazon-redshift" },
  { year: "2024", venue: "CIDR", title: "Panda: Performance Debugging for Databases using LLM Agents", authors: "Vikramank Singh, Kapil Vaidya, Vinayshekhar Bannihatti Kumar, et al.", href: "https://sites.google.com/site/muralibalki/research" },
  { year: "2023", venue: "NeurIPS", title: "Online Robust Non-stationary Estimation", authors: "Abishek Sankararaman, Balakrishnan Narayanaswamy", href: "https://www.amazon.science/publications/online-robust-non-stationary-estimation" },
  { year: "2023", venue: "SIGMOD", title: "Auto-WLM: Machine Learning Enhanced Workload Management in Amazon Redshift", authors: "Gaurav Saxena, Mohammad Rahman, Naresh Chainani, et al.", href: "https://www.amazon.science/publications/auto-wlm-machine-learning-enhanced-workload-management-in-amazon-redshift" },
  { year: "2020", venue: "KDD · Best Paper", title: "Temporal-Contextual Recommendation in Real-Time", authors: "Yifei Ma, Balakrishnan Narayanaswamy, Haibin Lin, Hao Ding", href: "https://www.amazon.science/publications/temporal-contextual-recommendation-in-real-time" },
];

export const patents = [
  ["2024", "Assisted Database Anomaly Mitigation", "US 12,130,788"],
  ["2023", "Detecting idle periods at network endpoints for management actions at processing clusters for managed databases", "WO2023097270A1"],
  ["2023", "Scaling query processing resources for efficient utilization and performance", "US Patent App. 17/547,831"],
  ["2023", "Dynamic compilation of machine learning models based on hardware configurations", "US 11,657,069"],
  ["2023", "Integrating query optimization with machine learning model prediction", "US 11,636,124"],
  ["2023", "Automatically refreshing materialized views according to performance benefit", "US 11,609,910"],
  ["2023", "Dynamic generation of match rules for rewriting queries to use materialized views", "US 11,550,787"],
  ["2021", "Goal-oriented dialog systems and methods", "US 10,963,819"],
  ["2020", "Task-oriented dialog systems utilizing combined supervised and reinforcement learning", "US 10,860,629"],
  ["2020", "Demand forecasting via direct quantile loss optimization", "US 10,783,442"],
  ["2017", "Non-technical loss detection and localization", "US 9,536,198"],
  ["2016", "Power factor", "US 9,343,904"],
  ["2016", "Condition-based management of power transformers", "US 9,312,695"],
  ["2015", "Enforcing fine-grained demand management in smart grids", "US 9,188,967"],
];
