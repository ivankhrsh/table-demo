# **🧠 Test Task — Frontend Engineer**

**Team:** MarTech

**Level:** Middle+/Senior

**Stack:** TypeScript · React · TanStack Table · Node.js BFF · PostgreSQL · Docker Compose

---

## **👋 Introduction**

Thanks for your interest in joining the **MarTech** team at **GuruApps**!

We’re building an internal [**Airtable-like](https://www.airtable.com/)👈** tool used daily by our marketing team. They create **up to 10,000 new creatives every month**, which quickly adds up to **hundreds of thousands of rows** of data that must remain searchable, editable, and fast.

We’re looking for someone who can build **high-performance UIs** that handle large datasets, realtime collaboration, and clean architecture.

This task is a simplified version of the real product you’ll work on.

---

## **🧭 Task Overview**

Build a small Airtable-style grid application with:

### **1. Large dataset rendering**

A table capable of showing **50,000+ rows** and **~20 columns**, with:

- **virtualization**
- **infinite scroll or single fetch**

> We currently use **TanStack Table** (and other TanStack tools)
> 

---

### **2. Simple Backend-for-Frontend (BFF)**

Tech stack for the BFF is up to you (Node.js, NestJS, Fastify, Express — anything is fine).

---

### **3. PostgreSQL database**

Use PostgreSQL as your data source.

We don’t expect a complex schema — a simple rows table is enough.

You can generate mock data on startup or via a script.

---

### **4. Realtime collaboration**

Your frontend should stay in sync across multiple tabs:

- User A edits a cell → all other clients see the update.
- Realtime sync should work even when users are connected to **different server nodes** (e.g. via Nginx load balancing).

---

### **5. Inline editing**

Support editing of at least:

- text
- number
- select

Optimistic updates are preferred.

---

## **📦 Docker Compose Requirement**

Your entire environment should run using: `docker-compose up` 

This should start:

- the frontend
- the BFF
- PostgreSQL

We will evaluate **developer experience** and **ease of setup**.

---

## **📐 What We Evaluate**

- Architecture & state management
- Rendering performance with large datasets
- Correct integration of virtualization + TanStack (optional)
- Clean realtime sync model
- Code readability & TypeScript quality
- Smoothness of UX (no jank)
- Setup simplicity via docker-compose

We don’t require pixel-perfect design — just good UI/UX fundamentals.

---

## **📤 Submission**

Please provide:

- Public GitHub repository link
- README with:
    - setup instructions
    - short architectural overview
    - known limitations or trade-offs or/and ADRs

---

## **🎯 Why This Task Matters**

This challenge mirrors our real work: building a reliable, realtime, high-performance internal data platform that powers marketing, creative, and production teams across **hundreds of thousands of assets**.

If this task feels exciting — you’ll fit right in.