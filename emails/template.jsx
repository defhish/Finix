import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

// --- Helper to format currency in INR ---
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);

// --- Dummy preview data ---
const PREVIEW_DATA = {
  monthlyReport: {
    userName: "Amelia",
    type: "monthly-report",
    data: {
      month: "August",
      accountName: "Primary Savings Account",
      stats: {
        totalIncome: 75000,
        totalExpenses: 48500,
        byCategory: {
          Housing: 18000,
          Groceries: 9500,
          Transportation: 5000,
          Entertainment: 4000,
          Utilities: 6000,
          "Other Expenses": 6000,
        },
      },
      insights: [
        "Your housing costs were the largest expense. A small reduction here could significantly boost your savings.",
        "Great job on keeping entertainment spending in check this month!",
        "You saved over 35% of your income. Keep up the fantastic work!",
      ],
    },
  },
  budgetAlert: {
    userName: "Amelia",
    type: "budget-alert",
    data: {
      percentageUsed: 85,
      budgetAmount: 50000,
      totalExpenses: 42500,
      accountName: "Monthly Spending Budget",
    },
  },
};

// --- Reusable Components ---
const EmailHeader = () => (
  <Section style={styles.header}>
    <Text style={styles.headerText}>Finix</Text>
  </Section>
);

const EmailFooter = () => (
  <>
    <Hr style={styles.hr} />
    <Section style={{ textAlign: "center" }}>
      <Text style={styles.footer}>
        Finix - Your Personal Finance Companion
        <br />
      </Text>
    </Section>
  </>
);

// --- Main Email Template ---
export default function EmailTemplate({ type, userName, data }) {
  // Use dummy data if nothing is passed for easy previewing
  const emailType = type || PREVIEW_DATA.monthlyReport.type;
  const emailUser = userName || PREVIEW_DATA.monthlyReport.userName;
  const emailData =
    data ||
    (emailType === "monthly-report"
      ? PREVIEW_DATA.monthlyReport.data
      : PREVIEW_DATA.budgetAlert.data);

  // --- Monthly Report ---
  if (emailType === "monthly-report") {
    const { stats = {}, month, insights = [], accountName } = emailData;
    const { totalIncome = 0, totalExpenses = 0, byCategory = {} } = stats;
    const netSavings = totalIncome - totalExpenses;
    const savingsColor =
      netSavings >= 0 ? styles.positive.color : styles.negative.color;

    return (
      <Html>
        <Head />
        <Preview>
          Your {month} financial report for {accountName} is ready!
        </Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <EmailHeader />
            <Heading style={styles.title}>
              Your {month} Financial Report
            </Heading>
            <Text style={styles.text}>Hi {emailUser},</Text>
            <Text style={styles.text}>
              Here’s your financial summary for the{" "}
              <strong>{accountName}</strong>.
            </Text>

            <Section style={styles.statsSection}>
              <Row>
                <Column style={styles.statCard}>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={{ ...styles.statValue, ...styles.positive }}>
                    {formatCurrency(totalIncome)}
                  </Text>
                </Column>
                <Column style={styles.statCard}>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={{ ...styles.statValue, ...styles.negative }}>
                    {formatCurrency(totalExpenses)}
                  </Text>
                </Column>
                <Column style={styles.statCard}>
                  <Text style={styles.statLabel}>Net Savings</Text>
                  <Text style={{ ...styles.statValue, color: savingsColor }}>
                    {formatCurrency(netSavings)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Heading style={styles.subHeading}>Spending Breakdown</Heading>
            <Section style={styles.categorySection}>
              {Object.entries(byCategory).map(([cat, val], idx) => (
                <Row
                  key={cat}
                  style={{
                    ...styles.categoryRow,
                    backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc",
                  }}
                >
                  <Column>
                    <Text style={styles.categoryLabel}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={styles.categoryValue}>
                      {formatCurrency(val)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {insights.length > 0 && (
              <>
                <Heading style={styles.subHeading}>Key Insights</Heading>
                <Section>
                  {insights.map((insight, idx) => (
                    <Text key={idx} style={styles.insightText}>
                      • {insight}
                    </Text>
                  ))}
                </Section>
              </>
            )}

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href="https://finix.com/dashboard">
                View Full Dashboard
              </Button>
            </Section>

            <EmailFooter />
          </Container>
        </Body>
      </Html>
    );
  }

  // --- Budget Alert ---
  if (emailType === "budget-alert") {
    const {
      percentageUsed = 0,
      budgetAmount = 0,
      totalExpenses = 0,
      accountName,
    } = emailData;
    const remaining = budgetAmount - totalExpenses;
    const remainingColor =
      remaining >= 0 ? styles.positive.color : styles.negative.color;
    const progressColor =
      percentageUsed > 90
        ? styles.negative.color
        : percentageUsed > 75
          ? "#f97316"
          : styles.brand.color;

    return (
      <Html>
        <Head />
        <Preview>
          You've used {percentageUsed.toFixed(0)}% of your budget for{" "}
          {accountName}
        </Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <EmailHeader />
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hi {emailUser},</Text>
            <Text style={styles.text}>
              This is an alert for your <strong>{accountName}</strong>. You have
              spent <strong>{formatCurrency(totalExpenses)}</strong>, which is{" "}
              <strong>{percentageUsed.toFixed(0)}%</strong> of your total
              budget.
            </Text>

            <Section style={styles.progressBarContainer}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${percentageUsed}%`,
                  backgroundColor: progressColor,
                }}
              />
            </Section>

            <Section style={styles.statsSection}>
              <Row>
                <Column style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Budget</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(budgetAmount)}
                  </Text>
                </Column>
                <Column style={styles.statCard}>
                  <Text style={styles.statLabel}>Spent</Text>
                  <Text style={{ ...styles.statValue, ...styles.negative }}>
                    {formatCurrency(totalExpenses)}
                  </Text>
                </Column>
                <Column style={styles.statCard}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={{ ...styles.statValue, color: remainingColor }}>
                    {formatCurrency(remaining)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href="https://finix.com/dashboard">
                Manage Your Budgets
              </Button>
            </Section>

            <EmailFooter />
          </Container>
        </Body>
      </Html>
    );
  }
}

// --- Styles ---
const styles = {
  // Color Palette
  brand: {
    color: "#06b6d4",
  },
  positive: {
    color: "#10b981",
  },
  negative: {
    color: "#ef4444",
  },

  // Layout
  body: {
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "40px auto",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    maxWidth: "600px",
    border: "1px solid #e2e8f0",
  },
  header: {
    paddingBottom: "24px",
    borderBottom: "2px solid #06b6d4", // subtle accent
  },
  headerText: {
    color: "#06b6d4",
    fontSize: "48px",
    fontWeight: "800",
    textAlign: "center",
    margin: 0,
  },
  title: {
    color: "#1e293b",
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
    margin: "0 0 24px",
    paddingTop: "20px",
  },
  subHeading: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginTop: "32px",
    marginBottom: "16px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#64748b",
    margin: "0 0 16px",
  },

  // Components
  statsSection: {
    margin: "32px 0",
  },
  statCard: {
    padding: "16px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
  },
  categorySection: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
  },
  categoryRow: {
    width: "100%",
    padding: "12px 16px",
  },
  categoryLabel: {
    fontSize: "15px",
    color: "#64748b",
  },
  categoryValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
  },
  insightText: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#64748b",
    margin: "0 0 10px",
  },
  progressBarContainer: {
    height: "12px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    margin: "32px 0",
    overflow: "hidden",
  },
  progressBar: {
    height: "12px",
    borderRadius: "6px",
    transition: "width 0.5s ease-in-out",
  },
  buttonContainer: {
    textAlign: "center",
    marginTop: "40px",
  },
  button: {
    backgroundColor: "#06b6d4",
    color: "#fff",
    padding: "16px 32px",
    borderRadius: "8px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
  hr: {
    borderColor: "#e2e8f0",
    margin: "40px 0",
  },
  footer: {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: "1.5",
  },
};
