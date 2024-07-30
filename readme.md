# Tarea 1 - Integración backend - Contrato

Api que reciba el correo del usuario, con este valide el userId, con ese userId valide el purchaseId y con ese valide si tiene transacciones en el contrato inteligente, en caso de que si mostrar cuanto tiene en un frontend

# Tarea 2 - Integración frontend - Contrato

Integrar función withdrawal en frontend con la wallet admin

# API Documentation

## Introduction

Welcome to the API documentation for our XM project. This document provides an overview of the available endpoints, their functionalities, and usage examples.

## Table of Contents

- [Getting Started](#getting-started)
- [Endpoints](#endpoints)
  - [User Endpoints](#user-endpoints)
  - [Product Endpoints](#product-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Contact](#contact)

## Getting Started

To start using the API, you need to base URL of the API server and any required authentication tokens (Skipped in this demo).

### Base URL

```plaintext
http://localhost:3000
```

**Endpoints**

**User - Get User Information**

• **URL:** /users

• **Method:** GET

• **Response:**

```json
[
  {
    "email": "usuario1@mail.com",
    "pubKey": "0x1aB14C91cBE33Ca32A43E787c96eFB02D83ce6Fe",
    "priKey": "0x786489354cc0b45021cd79d192025762aa70b75732fcf4bc693500596f042125"
  }
]
```

**Accounts - Get New Account**

• **URL:** /

• **Method:** GET

• **Response:**

```json
[
  {
    "address": "0xF443567CB243c92D45975aFA24B3B8Ca787F2C87",
    "privateKey": "0xc3bca8e7d52391cfa4fab384bc63ad8f7daddf6a05f2595104d38fad2b11630b"
  }
]
```

**Load - Load custom wallet with crypto**

• **URL:** /transfer

• **Method:** POST

• **Request Body:**

```json
{
  "amount": 0.1,
  "receiver": "0x1aB14C91cBE33Ca32A43E787c96eFB02D83ce6Fe"
}
```

• **Response:**

```json
{
  "hash": "0xcb530add62ebb7775bde760b37c5245aaaf68e4737c14523243878e3d6f0e824"
}
```

**Purchase - Buy a offer**

• **URL:** /purchase

• **Method:** POST

• **Headers:**

```json
{
  "Authorization": "bearer usuario1@mail.com"
}
```

• **Request Body:**

```json
{
  "idOffer": 1
}
```

• **Response:**

```json
{
  "message": "PURCHASE_DONE",
  "id": 1
}
```
