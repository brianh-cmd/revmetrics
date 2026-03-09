import React, { useState, useEffect } from "react";

const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;
const STRIPE_PK     = process.env.REACT_APP_STRIPE_PK;
const PRICE_MONTHLY = process.env.REACT_APP_STRIPE_MONTHLY;
const PRICE_ANNUAL  = process.env.REACT_APP_STRIPE_ANNUAL;

const C = {
  bg:"#0A0A0F", surface:"#13131A", card:"#1C1C26", border:"#2A2A38",
  accent:"#E8FF47", text:"#F0F0F0", muted:"#7A7A9A",
  green:"#3DFF8F", yellow:"#FFD447", red:"#FF4D6A",
};

const MARKET_DATA = {
  "Porsche 912":              {base:42000, trend:6.1,  supply:"Low",      hot:false},
  "Porsche 356":              {base:85000, trend:7.4,  supply:"Very Low", hot:true },
  "Porsche 944":              {base:18000, trend:9.1,  supply:"Medium",   hot:true },
  "Porsche 914":              {base:22000, trend:11.2, supply:"Low",      hot:true },
  "Porsche Boxster (986)":    {base:14000, trend:8.8,  supply:"Medium",   hot:false},
  "Porsche Cayman (987)":     {base:22000, trend:7.3,  supply:"Medium",   hot:false},
  "Honda NSX (NA1)":          {base:88000, trend:18.2, supply:"Very Low", hot:true },
  "Honda Beat":               {base:12000, trend:14.1, supply:"Very Low", hot:true },
  "Honda CRX":                {base:11000, trend:9.3,  supply:"Low",      hot:true },
  "Honda Civic EF":           {base:9500,  trend:8.7,  supply:"Low",      hot:true },
  "Honda Civic EG":           {base:12000, trend:10.2, supply:"Low",      hot:true },
  "Honda Integra Type R":     {base:32000, trend:15.4, supply:"Very Low", hot:true },
  "BMW 2002":                 {base:22000, trend:5.2,  supply:"Low",      hot:false},
  "BMW E30":                  {base:18000, trend:7.8,  supply:"Low",      hot:true },
  "BMW E28 M5":               {base:45000, trend:9.1,  supply:"Very Low", hot:true },
  "BMW 8 Series":             {base:52000, trend:11.3, supply:"Low",      hot:true },
  "BMW Z8":                   {base:185000,trend:6.2,  supply:"Very Low", hot:false},
  "Toyota Supra (A70)":       {base:28000, trend:12.1, supply:"Low",      hot:true },
  "Toyota Celica":            {base:14000, trend:8.4,  supply:"Low",      hot:true },
  "Toyota MR2":               {base:16000, trend:9.7,  supply:"Low",      hot:true },
  "Toyota FJ40":              {base:65000, trend:7.2,  supply:"Low",      hot:false},
  "Toyota 2000GT":            {base:550000,trend:4.1,  supply:"Very Low", hot:false},
  "Mitsubishi 3000GT VR4":    {base:22000, trend:8.3,  supply:"Low",      hot:true },
  "Subaru WRX (GC8)":         {base:18000, trend:9.4,  supply:"Low",      hot:true },
  "Ford Bronco (Early)":      {base:68000, trend:6.8,  supply:"Low",      hot:false},
  "Ford Mustang Boss 302":    {base:85000, trend:4.2,  supply:"Low",      hot:false},
  "Ford Mustang Shelby GT500":{base:95000, trend:5.1,  supply:"Low",      hot:false},
  "Ford Mustang (Fox Body)":  {base:18000, trend:7.3,  supply:"Medium",   hot:true },
  "Ford GT40":                {base:2800000,trend:3.1, supply:"Very Low", hot:false},
  "Ford GT (2005)":           {base:285000,trend:5.4,  supply:"Very Low", hot:false},
  "Ford F100":                {base:32000, trend:6.1,  supply:"Medium",   hot:false},
  "Chevrolet Corvette C2":    {base:65000, trend:3.8,  supply:"Low",      hot:false},
  "Chevrolet Corvette C3":    {base:28000, trend:2.9,  supply:"Medium",   hot:false},
  "Chevrolet Corvette C4":    {base:16000, trend:4.2,  supply:"Medium",   hot:false},
  "Chevrolet Corvette C5 Z06":{base:28000, trend:6.8,  supply:"Medium",   hot:false},
  "Chevrolet Camaro Z28":     {base:35000, trend:3.4,  supply:"Medium",   hot:false},
  "Chevrolet Camaro (1969)":  {base:72000, trend:2.8,  supply:"Low",      hot:false},
  "Chevrolet Chevelle SS":    {base:68000, trend:2.4,  supply:"Low",      hot:false},
  "Chevrolet El Camino":      {base:28000, trend:3.1,  supply:"Medium",   hot:false},
  "Chevrolet Blazer (K5)":    {base:42000, trend:8.2,  supply:"Low",      hot:true },
  "Dodge Viper":              {base:52000, trend:7.3,  supply:"Low",      hot:true },
  "Dodge Challenger (1970)":  {base:85000, trend:2.9,  supply:"Low",      hot:false},
  "Dodge Charger (1969)":     {base:95000, trend:3.1,  supply:"Low",      hot:false},
  "Plymouth Cuda":            {base:125000,trend:2.2,  supply:"Very Low", hot:false},
  "Plymouth Barracuda":       {base:48000, trend:2.8,  supply:"Low",      hot:false},
  "Pontiac GTO":              {base:52000, trend:2.6,  supply:"Low",      hot:false},
  "Pontiac Firebird Trans Am":{base:32000, trend:4.1,  supply:"Medium",   hot:false},
  "Buick Grand National":     {base:38000, trend:5.8,  supply:"Low",      hot:true },
  "Mercedes 300SL Gullwing":  {base:1200000,trend:2.8, supply:"Very Low", hot:false},
  "Mercedes 190E 2.3-16":     {base:28000, trend:9.2,  supply:"Very Low", hot:true },
  "Mercedes 280SL Pagoda":    {base:72000, trend:4.1,  supply:"Low",      hot:false},
  "Mercedes R107 SL":         {base:32000, trend:5.8,  supply:"Medium",   hot:false},
  "Mercedes W123":            {base:14000, trend:6.2,  supply:"Medium",   hot:false},
  "Ferrari 308":              {base:85000, trend:4.2,  supply:"Low",      hot:false},
  "Ferrari 328":              {base:115000,trend:5.1,  supply:"Low",      hot:false},
  "Ferrari 348":              {base:72000, trend:3.8,  supply:"Low",      hot:false},
  "Ferrari 355":              {base:95000, trend:4.4,  supply:"Low",      hot:false},
  "Ferrari 360":              {base:85000, trend:3.9,  supply:"Low",      hot:false},
  "Ferrari 456":              {base:55000, trend:3.2,  supply:"Low",      hot:false},
  "Ferrari Testarossa":       {base:135000,trend:6.8,  supply:"Low",      hot:true },
  "Ferrari Mondial":          {base:38000, trend:2.1,  supply:"Medium",   hot:false},
  "Lamborghini Countach":     {base:385000,trend:7.2,  supply:"Very Low", hot:true },
  "Lamborghini Diablo":       {base:225000,trend:8.4,  supply:"Very Low", hot:true },
  "Lamborghini Murcielago":   {base:185000,trend:5.6,  supply:"Low",      hot:false},
  "Lamborghini Gallardo":     {base:95000, trend:4.8,  supply:"Low",      hot:false},
  "Alfa Romeo Spider":        {base:18000, trend:5.1,  supply:"Medium",   hot:false},
  "Alfa Romeo GTV6":          {base:14000, trend:6.8,  supply:"Low",      hot:false},
  "Alfa Romeo Montreal":      {base:62000, trend:7.2,  supply:"Very Low", hot:false},
  "Jaguar E-Type":            {base:95000, trend:3.8,  supply:"Low",      hot:false},
  "Jaguar XJS":               {base:14000, trend:4.1,  supply:"Medium",   hot:false},
  "Jaguar XK8":               {base:18000, trend:3.8,  supply:"Medium",   hot:false},
  "Aston Martin DB5":         {base:850000,trend:3.1,  supply:"Very Low", hot:false},
  "Aston Martin DB7":         {base:42000, trend:4.2,  supply:"Low",      hot:false},
  "Aston Martin Vantage V8":  {base:52000, trend:5.8,  supply:"Low",      hot:false},
  "Maserati Ghibli (AM115)":  {base:55000, trend:4.1,  supply:"Very Low", hot:false},
  "Maserati Bora":            {base:145000,trend:5.2,  supply:"Very Low", hot:false},
  "Lotus Elan":               {base:28000, trend:4.8,  supply:"Very Low", hot:false},
  "Lotus Esprit":             {base:35000, trend:5.1,  supply:"Low",      hot:false},
  "Lotus Elise":              {base:28000, trend:6.2,  supply:"Low",      hot:false},
  "De Tomaso Pantera":        {base:95000, trend:5.4,  supply:"Very Low", hot:false},
  "Shelby Cobra":             {base:185000,trend:4.2,  supply:"Very Low", hot:false},
  "Mazda RX-7 (FC)":          {base:18000, trend:9.8,  supply:"Low",      hot:true },
  "Mazda RX-7 (FD)":          {base:38000, trend:14.2, supply:"Very Low", hot:true },
  "Mazda MX-5 (NA)":          {base:12000, trend:7.8,  supply:"Medium",   hot:true },
  "Mazda MX-5 (NB)":          {base:10000, trend:6.4,  supply:"Medium",   hot:false},
  "Nissan Skyline GT-R (R32)":{base:45000, trend:18.4, supply:"Very Low", hot:true },
  "Nissan Skyline GT-R (R33)":{base:38000, trend:15.2, supply:"Very Low", hot:true },
  "Nissan Skyline GT-R (R34)":{base:95000, trend:22.1, supply:"Very Low", hot:true },
  "Nissan 240SX":             {base:14000, trend:9.2,  supply:"Low",      hot:true },
  "Nissan 300ZX (Z32)":       {base:22000, trend:8.4,  supply:"Low",      hot:true },
  "Nissan 350Z":              {base:14000, trend:5.2,  supply:"Medium",   hot:false},
  "Nissan Silvia S13":        {base:18000, trend:11.3, supply:"Low",      hot:true },
  "Land Rover Defender 90":   {base:52000, trend:9.8,  supply:"Low",      hot:true },
  "Land Rover Defender 110":  {base:58000, trend:8.4,  supply:"Low",      hot:true },
  "Land Rover Series III":    {base:28000, trend:6.2,  supply:"Low",      hot:false},
  "Range Rover Classic":      {base:32000, trend:8.8,  supply:"Low",      hot:true },
  "Volkswagen Golf GTI (Mk1)":{base:22000, trend:9.4,  supply:"Low",      hot:true },
  "Volkswagen Golf GTI (Mk2)":{base:18000, trend:7.8,  supply:"Low",      hot:true },
  "Volkswagen Beetle":        {base:14000, trend:3.2,  supply:"Medium",   hot:false},
  "Volkswagen Bus":           {base:38000, trend:5.8,  supply:"Low",      hot:false},
  "Volkswagen Karmann Ghia":  {base:22000, trend:4.1,  supply:"Medium",   hot:false},
  "Fiat 124 Spider":          {base:12000, trend:4.8,  supply:"Medium",   hot:false},
  "Fiat X1/9":                {base:8500,  trend:5.2,  supply:"Medium",   hot:false},
  "Triumph TR6":              {base:22000, trend:3.8,  supply:"Medium",   hot:false},
  "Triumph Spitfire":         {base:12000, trend:3.2,  supply:"Medium",   hot:false},
  "MGB":                      {base:14000, trend:3.1,  supply:"Medium",   hot:false},
  "Austin-Healey 3000":       {base:48000, trend:2.8,  supply:"Low",      hot:false},
  "Sunbeam Tiger":            {base:38000, trend:4.2,  supply:"Very Low", hot:false},
  "Honda CB750 (SOHC)":       {base:12000, trend:8.4,  supply:"Low",      hot:true },
  "Honda CB750 (DOHC)":       {base:8500,  trend:6.2,  supply:"Medium",   hot:false},
  "Honda RC30":               {base:28000, trend:9.8,  supply:"Very Low", hot:true },
  "Honda RC45":               {base:38000, trend:8.4,  supply:"Very Low", hot:true },
  "Honda CBR900RR (SC28)":    {base:9500,  trend:7.2,  supply:"Low",      hot:true },
  "Honda Monkey":             {base:4500,  trend:6.8,  supply:"Medium",   hot:false},
  "Honda CT70":               {base:3800,  trend:8.2,  supply:"Medium",   hot:true },
  "Ducati 916":               {base:18000, trend:9.4,  supply:"Low",      hot:true },
  "Ducati 996":               {base:14000, trend:7.8,  supply:"Low",      hot:true },
  "Ducati 999":               {base:10000, trend:5.2,  supply:"Medium",   hot:false},
  "Ducati 748":               {base:9500,  trend:6.4,  supply:"Medium",   hot:false},
  "Ducati Monster (M900)":    {base:7500,  trend:7.1,  supply:"Medium",   hot:false},
  "Ducati Panigale V4":       {base:22000, trend:4.2,  supply:"Medium",   hot:false},
  "BMW R90S":                 {base:18000, trend:7.4,  supply:"Low",      hot:true },
  "BMW R69S":                 {base:22000, trend:5.8,  supply:"Very Low", hot:false},
  "BMW R100RS":               {base:9500,  trend:5.1,  supply:"Low",      hot:false},
  "BMW R nineT":              {base:12000, trend:3.8,  supply:"Medium",   hot:false},
  "Harley-Davidson Knucklehead":{base:45000,trend:3.2, supply:"Very Low", hot:false},
  "Harley-Davidson Panhead":  {base:32000, trend:2.8,  supply:"Very Low", hot:false},
  "Harley-Davidson Shovelhead":{base:18000,trend:3.4,  supply:"Low",      hot:false},
  "Harley-Davidson Sportster":{base:8500,  trend:2.1,  supply:"High",     hot:false},
  "Kawasaki Z1":              {base:18000, trend:8.8,  supply:"Low",      hot:true },
  "Kawasaki H2 Mach IV":      {base:12000, trend:7.2,  supply:"Low",      hot:true },
  "Kawasaki KZ1000":          {base:9500,  trend:6.4,  supply:"Low",      hot:false},
  "Suzuki GSX-R750 (Slab)":   {base:8500,  trend:7.8,  supply:"Low",      hot:true },
  "Suzuki GT750":             {base:9500,  trend:6.2,  supply:"Low",      hot:false},
  "Suzuki Katana":            {base:7500,  trend:5.4,  supply:"Medium",   hot:false},
  "Triumph Bonneville T120":  {base:12000, trend:5.8,  supply:"Medium",   hot:false},
  "Triumph T140":             {base:9500,  trend:5.2,  supply:"Medium",   hot:false},
  "Triumph Speed Triple":     {base:8500,  trend:4.1,  supply:"Medium",   hot:false},
  "Norton Commando":          {base:14000, trend:5.4,  supply:"Low",      hot:false},
  "Norton Manx":              {base:38000, trend:4.8,  supply:"Very Low", hot:false},
  "Indian Chief (Vintage)":   {base:22000, trend:4.2,  supply:"Low",      hot:false},
  "Indian Scout":             {base:12000, trend:3.8,  supply:"Medium",   hot:false},
  "Moto Guzzi Le Mans":       {base:12000, trend:5.8,  supply:"Low",      hot:false},
  "Vincent Black Shadow":     {base:85000, trend:3.2,  supply:"Very Low", hot:false},
  "Yamaha RD350":             {base:6500,  trend:7.2,  supply:"Low",      hot:true },
  "Yamaha XS650":             {base:5500,  trend:6.8,  supply:"Medium",   hot:false},
  "Yamaha VMAX (1200)":       {base:8500,  trend:5.4,  supply:"Low",      hot:false},
  "Chris-Craft Runabout":     {base:45000, trend:5.8,  supply:"Low",      hot:false},
  "Chris-Craft Cobra":        {base:65000, trend:6.2,  supply:"Very Low", hot:false},
  "Riva Aquarama":            {base:285000,trend:5.1,  supply:"Very Low", hot:false},
  "Riva Ariston":             {base:125000,trend:4.8,  supply:"Very Low", hot:false},
  "Correct Craft Ski Nautique":{base:18000,trend:4.2,  supply:"Low",      hot:false},
  "MasterCraft ProStar 190":  {base:22000, trend:4.8,  supply:"Low",      hot:false},
  "Donzi 16 Classic":         {base:18000, trend:5.4,  supply:"Low",      hot:false},
  "Boston Whaler 13":         {base:8500,  trend:6.8,  supply:"Medium",   hot:true },
  "Boston Whaler Outrage 18": {base:18000, trend:5.2,  supply:"Medium",   hot:false},
  "Bertram 31":               {base:28000, trend:3.8,  supply:"Low",      hot:false},
  "Cigarette 35 Racer":       {base:45000, trend:4.1,  supply:"Low",      hot:false},
  "Malibu Response LX":       {base:22000, trend:4.8,  supply:"Low",      hot:false},
  "Nautique 196":             {base:28000, trend:5.2,  supply:"Low",      hot:false},
  "Grady-White 272":          {base:32000, trend:3.8,  supply:"Low",      hot:false},
  "Ranger 521":               {base:28000, trend:4.2,  supply:"Low",      hot:false},
  "Skeeter ZX190":            {base:18000, trend:3.8,  supply:"Medium",   hot:false},

  "Porsche 911 (964)":     {base:82000, trend:6.1,  supply:"Low",      hot:true,  bat:"964+911"},
  "Porsche 911 (993)":     {base:105000,trend:7.4,  supply:"Low",      hot:true,  bat:"993+911"},
  "Porsche 911 (996)":     {base:38000, trend:4.2,  supply:"Medium",   hot:false, bat:"996+911"},
  "Porsche 911 (997)":     {base:62000, trend:5.8,  supply:"Medium",   hot:true,  bat:"997+911"},
  "Porsche 944":           {base:18000, trend:6.2,  supply:"Medium",   hot:false, bat:"porsche+944"},
  "Porsche 928":           {base:22000, trend:5.4,  supply:"Low",      hot:false, bat:"porsche+928"},
  "Porsche Boxster (986)": {base:14000, trend:4.8,  supply:"Medium",   hot:false, bat:"boxster+986"},
  "Honda S2000":           {base:32000, trend:14.2, supply:"Very Low", hot:true,  bat:"honda+s2000"},
  "Honda NSX (NA1)":       {base:92000, trend:19.5, supply:"Very Low", hot:true,  bat:"honda+nsx"},
  "Honda Civic Type R (EK9)":{base:28000,trend:18.1,supply:"Very Low", hot:true,  bat:"civic+type+r"},
  "Honda CRX Si":          {base:14000, trend:9.2,  supply:"Low",      hot:true,  bat:"honda+crx"},
  "BMW E30 M3":            {base:72000, trend:5.1,  supply:"Very Low", hot:true,  bat:"e30+m3"},
  "BMW E46 M3":            {base:28000, trend:8.4,  supply:"Low",      hot:true,  bat:"e46+m3"},
  "BMW E92 M3":            {base:32000, trend:6.2,  supply:"Medium",   hot:false, bat:"e92+m3"},
  "BMW M5 (E39)":          {base:24000, trend:9.8,  supply:"Low",      hot:true,  bat:"e39+m5"},
  "BMW M5 (E60)":          {base:18000, trend:5.2,  supply:"Medium",   hot:false, bat:"e60+m5"},
  "BMW 2002":              {base:22000, trend:4.8,  supply:"Low",      hot:false, bat:"bmw+2002"},
  "BMW 3.0 CSL":           {base:185000,trend:3.2,  supply:"Very Low", hot:false, bat:"bmw+3.0+csl"},
  "Toyota Supra (A80)":    {base:68000, trend:16.2, supply:"Very Low", hot:true,  bat:"toyota+supra+a80"},
  "Toyota Supra (A70)":    {base:22000, trend:9.4,  supply:"Low",      hot:true,  bat:"toyota+supra+a70"},
  "Toyota Land Cruiser (FJ40)":{base:58000,trend:12.1,supply:"Low",   hot:true,  bat:"fj40"},
  "Toyota Land Cruiser (80 Series)":{base:42000,trend:14.8,supply:"Low",hot:true,bat:"land+cruiser+80"},
  "Toyota MR2 (AW11)":     {base:14000, trend:11.2, supply:"Low",      hot:true,  bat:"mr2+aw11"},
  "Toyota MR2 (SW20)":     {base:18000, trend:13.4, supply:"Low",      hot:true,  bat:"mr2+sw20"},
  "Mitsubishi Evo VIII":   {base:34000, trend:11.2, supply:"Low",      hot:true,  bat:"evo+viii"},
  "Mitsubishi Evo IX":     {base:38000, trend:12.8, supply:"Low",      hot:true,  bat:"evo+ix"},
  "Subaru WRX STI (GD)":   {base:26000, trend:7.4,  supply:"Medium",   hot:false, bat:"subaru+sti"},
  "Subaru WRX STI (GR)":   {base:22000, trend:5.8,  supply:"Medium",   hot:false, bat:"subaru+sti+gr"},
  "Ford Bronco (Early)":   {base:62000, trend:8.4,  supply:"Low",      hot:true,  bat:"early+bronco"},
  "Ford Mustang Boss 302": {base:48000, trend:5.2,  supply:"Low",      hot:false, bat:"mustang+boss+302"},
  "Ford Mustang GT350":    {base:82000, trend:6.8,  supply:"Low",      hot:true,  bat:"mustang+gt350"},
  "Ford GT40":             {base:420000,trend:3.1,  supply:"Very Low", hot:false, bat:"ford+gt40"},
  "Chevrolet Corvette C2": {base:62000, trend:4.8,  supply:"Low",      hot:false, bat:"corvette+c2"},
  "Chevrolet Corvette C3": {base:28000, trend:3.8,  supply:"Medium",   hot:false, bat:"corvette+c3"},
  "Chevrolet Camaro Z28":  {base:38000, trend:4.2,  supply:"Low",      hot:false, bat:"camaro+z28"},
  "Dodge Viper GTS":       {base:52000, trend:7.8,  supply:"Low",      hot:true,  bat:"viper+gts"},
  "Ferrari 308":           {base:58000, trend:5.4,  supply:"Low",      hot:false, bat:"ferrari+308"},
  "Ferrari 328":           {base:82000, trend:6.2,  supply:"Low",      hot:true,  bat:"ferrari+328"},
  "Ferrari 348":           {base:48000, trend:4.8,  supply:"Low",      hot:false, bat:"ferrari+348"},
  "Ferrari F355":          {base:92000, trend:7.4,  supply:"Low",      hot:true,  bat:"ferrari+f355"},
  "Ferrari 456":           {base:62000, trend:3.8,  supply:"Low",      hot:false, bat:"ferrari+456"},
  "Lamborghini Countach":  {base:380000,trend:4.2,  supply:"Very Low", hot:false, bat:"lamborghini+countach"},
  "Lamborghini Diablo":    {base:220000,trend:5.8,  supply:"Very Low", hot:true,  bat:"lamborghini+diablo"},
  "Mercedes 300SL Gullwing":{base:920000,trend:2.8, supply:"Very Low", hot:false, bat:"300sl+gullwing"},
  "Mercedes 280SL (Pagoda)":{base:68000,trend:5.2,  supply:"Low",      hot:false, bat:"mercedes+280sl"},
  "Mercedes 190E 2.3-16":  {base:28000, trend:8.4,  supply:"Low",      hot:true,  bat:"190e+2.3-16"},
  "Alfa Romeo Spider":     {base:18000, trend:5.8,  supply:"Medium",   hot:false, bat:"alfa+romeo+spider"},
  "Alfa Romeo GTV6":       {base:14000, trend:6.2,  supply:"Low",      hot:false, bat:"alfa+gtv6"},
  "Lancia Delta Integrale":{base:58000, trend:12.4, supply:"Very Low", hot:true,  bat:"lancia+delta+integrale"},
  "Mazda RX-7 (FC)":       {base:16000, trend:10.2, supply:"Low",      hot:true,  bat:"rx7+fc"},
  "Mazda RX-7 (FD)":       {base:38000, trend:18.4, supply:"Very Low", hot:true,  bat:"rx7+fd"},
  "Mazda Miata (NA)":      {base:14000, trend:8.8,  supply:"Medium",   hot:true,  bat:"miata+na"},
  "Nissan Skyline GT-R (R32)":{base:42000,trend:22.4,supply:"Very Low",hot:true,  bat:"r32+gtr"},
  "Nissan Skyline GT-R (R33)":{base:52000,trend:18.2,supply:"Very Low",hot:true,  bat:"r33+gtr"},
  "Nissan Skyline GT-R (R34)":{base:85000,trend:24.8,supply:"Very Low",hot:true,  bat:"r34+gtr"},
  "Nissan 240SX":          {base:14000, trend:12.4, supply:"Low",      hot:true,  bat:"nissan+240sx"},
  "Nissan 300ZX (Z32)":    {base:22000, trend:9.8,  supply:"Low",      hot:true,  bat:"300zx+z32"},
};
const CONDITIONS    = ["Concours","Excellent","Good","Fair","Project"];
const COND_MULT     = {Concours:1.35,Excellent:1.15,Good:1.0,Fair:0.78,Project:0.52};
const MILE_BRACKETS = ["Under 30k","30k–60k","60k–100k","100k–150k","150k+"];
const MILE_MULT     = {"Under 30k":1.18,"30k–60k":1.05,"60k–100k":1.0,"100k–150k":0.88,"150k+":0.72};

const sb = {
  async signUp(email,password){
    const r=await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})});return r.json();
  },
  async signIn(email,password){
    const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})});return r.json();
  },
  async getProfile(uid,tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=*`,
      {headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`}});
    const d=await r.json();return d?.[0]||null;
  },
  async upsertProfile(profile,tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/profiles`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`,
        "Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=representation"},
      body:JSON.stringify(profile)});return r.json();
  },
  async getComps(tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/comps?select=*&order=created_at.desc&limit=20`,
      {headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`}});return r.json();
  },
  async insertComp(comp,tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/comps`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`,
        "Content-Type":"application/json","Prefer":"return=representation"},
      body:JSON.stringify(comp)});return r.json();
  }
};

function makeRefCode(email){
  return email.split("@")[0].toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6)+
    Math.floor(1000+Math.random()*9000);
}
function scoreDeals(market,asked,condition,mileage,year){
  const age=2026-parseInt(year||2026);
  const fair=market.base*COND_MULT[condition]*MILE_MULT[mileage]*Math.max(0.6,1-age*0.004);
  const diff=((fair-asked)/fair)*100;
  let score,label,color,summary;
  if(diff>=12){score=95;label="Great Deal";color=C.green;summary="Priced well below market. Strong buy signal."}
  else if(diff>=4){score=78;label="Good Deal";color=C.green;summary="Below market value. Worth pursuing."}
  else if(diff>=-4){score=58;label="Fair Price";color=C.yellow;summary="In line with market. Negotiate on condition."}
  else if(diff>=-12){score=35;label="Overpriced";color=C.yellow;summary="Above market. Negotiate down."}
  else{score=12;label="Walk Away";color=C.red;summary="Significantly overpriced. Better deals exist."}
  return{score,label,color,fair:Math.round(fair),diff:Math.round(diff),summary};
}

function batLink(vehicleName) {
  const d = (typeof MARKET_DATA !== "undefined" ? MARKET_DATA : {})[vehicleName];
  const query = d?.bat || vehicleName.toLowerCase().replace(/[^a-z0-9]+/g, "+");
  return `https://bringatrailer.com/search/?s=${query}#listing-results`;
}

async function redirectToCheckout(priceId,email,refCode){
  const res=await fetch('/api/create-checkout-session',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({priceId,email,refCode})
  });
  const data=await res.json();
  if(data.url) window.location.href=data.url;
  else throw new Error(data.error||'Failed to create checkout session');
}

function Tag({children,color}){return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:6,padding:"2px 10px",fontSize:12,fontWeight:700}}>{children}</span>;}
function Inp({label,value,onChange,placeholder="",type="text",error=false}){return(<div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<label style={{fontSize:11,color:error?"#ff4444":C.muted,letterSpacing:1,textTransform:"uppercase"}}>{label}{error&&<span style={{marginLeft:4,fontSize:10}}>← Required</span>}</label>}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:C.surface,border:`1px solid ${error?"#ff4444":C.border}`,borderRadius:10,color:C.text,padding:"12px 14px",fontSize:15,outline:"none",width:"100%",boxSizing:"border-box"}}/></div>);}
function Sel({label,value,onChange,options,error=false}){return(<div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<label style={{fontSize:11,color:error?"#ff4444":C.muted,letterSpacing:1,textTransform:"uppercase"}}>{label}{error&&<span style={{marginLeft:4,fontSize:10}}>← Required</span>}</label>}<select value={value} onChange={e=>onChange(e.target.value)} style={{background:C.surface,border:`1px solid ${error?"#ff4444":C.border}`,borderRadius:10,color:value?C.text:C.muted,padding:"12px 14px",fontSize:15,outline:"none",width:"100%",appearance:"none",cursor:"pointer"}}><option value="" disabled>Select…</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></div>);}

function VehicleSearch({label, value, onChange, options, error=false}) {
  const [query, setQuery] = React.useState(value || "");
  const [open, setOpen] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(0);
  const ref = React.useRef(null);

  const filtered = query.length < 1 ? [] : options.filter(o =>
    o.toLowerCase().split(/\s+/).some(word => word.startsWith(query.toLowerCase())) ||
    o.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(option) {
    setQuery(option);
    onChange(option);
    setOpen(false);
    setHighlighted(0);
  }

  function handleKey(e) {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h+1, filtered.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted(h => Math.max(h-1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); select(filtered[highlighted]); }
    if (e.key === "Escape")    { setOpen(false); }
  }

  function handleChange(e) {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    setHighlighted(0);
    onChange(v);
  }

  return (
    <div ref={ref} style={{display:"flex",flexDirection:"column",gap:5,position:"relative"}}>
      {label && <label style={{fontSize:11,color:error?C.red:C.muted,letterSpacing:1,textTransform:"uppercase"}}>
        {label}{error && <span style={{marginLeft:4,fontSize:10}}>← Required</span>}
      </label>}
      <div style={{position:"relative"}}>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => { if (query.length > 0) setOpen(true); }}
          onKeyDown={handleKey}
          placeholder="Type to search (e.g. Porsche, S2000...)"
          autoComplete="off"
          style={{background:C.surface,border:`1px solid ${error?C.red:open&&filtered.length>0?C.accent:C.border}`,
            borderRadius:open&&filtered.length>0?"10px 10px 0 0":10,color:C.text,
            padding:"12px 36px 12px 14px",fontSize:15,outline:"none",width:"100%",boxSizing:"border-box"}}
        />
        {query && (
          <button onClick={()=>{setQuery("");onChange("");setOpen(false);}}
            style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
              background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer",
              lineHeight:1,padding:"0 2px"}}>×</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.surface,
          border:`1px solid ${C.accent}`,borderTop:"none",borderRadius:"0 0 10px 10px",
          zIndex:100,maxHeight:280,overflowY:"auto"}}>
          {filtered.map((o, i) => {
            const lq = query.toLowerCase();
            const lo = o.toLowerCase();
            const idx = lo.indexOf(lq);
            const before = idx >= 0 ? o.slice(0, idx) : o;
            const match  = idx >= 0 ? o.slice(idx, idx + query.length) : "";
            const after  = idx >= 0 ? o.slice(idx + query.length) : "";
            return (
              <div key={o} onMouseDown={()=>select(o)} onMouseEnter={()=>setHighlighted(i)}
                style={{padding:"11px 14px",cursor:"pointer",fontSize:14,
                  background:i===highlighted?C.accent+"22":"transparent",
                  borderBottom:i<filtered.length-1?`1px solid ${C.border}`:"none",
                  color:i===highlighted?C.accent:C.text}}>
                {before}<strong style={{color:C.accent}}>{match}</strong>{after}
              </div>
            );
          })}
        </div>
      )}
      {value && query === value && (
        <div style={{fontSize:11,color:C.green,marginTop:2}}>✓ {value}</div>
      )}
    </div>
  );
}

function Btn({children,onClick,disabled,color=C.accent,style={}}){return(<button onClick={onClick} disabled={disabled} style={{background:color,color:C.bg,border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:800,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,width:"100%",letterSpacing:.5,...style}}>{children}</button>);}
function Gauge({score,color}){const r=54,cx=70,cy=70,circ=Math.PI*r,fill=(score/100)*circ;return(<svg width="140" height="80" viewBox="0 0 140 80"><path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke={C.border} strokeWidth="10"/><path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.8s ease"}}/><text x={cx} y={cy-8} textAnchor="middle" fill={color} fontSize="22" fontWeight="800">{score}</text><text x={cx} y={cy+2} textAnchor="middle" fill={C.muted} fontSize="9">/100</text></svg>);}

function AuthScreen({onAuth,refCode}){
  const [mode,setMode]=useState("signin");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function handleSubmit(){
    if(!email||!pass){setError("Please fill in all fields.");return;}
    setLoading(true);setError("");
    try{
      if(mode==="signup"){
        const res=await sb.signUp(email,pass);
        if(res.error){setError(res.error.message);setLoading(false);return;}
        setError("✅ Check your email to confirm your account, then sign in.");
        setMode("signin");
      }else{
        const res=await sb.signIn(email,pass);
        if(res.error){setError(res.error.message);setLoading(false);return;}
        const tok=res.access_token,uid=res.user?.id;
        let profile=await sb.getProfile(uid,tok);
        if(!profile){
          const code=makeRefCode(email);
          const created=await sb.upsertProfile({id:uid,email,plan:"none",
            referral_code:code,referred_by:refCode||null,referral_credits:0},tok);
          profile=Array.isArray(created)?created[0]:created;
        }
        onAuth({token:tok,userId:uid,email,profile});
      }
    }catch(e){setError(e.message);}
    setLoading(false);
  }
  return(
    <div style={{padding:"32px 20px",display:"flex",flexDirection:"column",gap:18,maxWidth:400,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{background:C.accent,color:C.bg,fontWeight:900,fontSize:14,borderRadius:6,padding:"3px 10px"}}>REV</span>
          <span style={{fontWeight:800,fontSize:22}}>METRICS</span>
        </div>
        <div style={{fontSize:13,color:C.muted}}>Collector Car Intelligence</div>
      </div>
      {refCode&&<div style={{background:C.green+"15",border:`1px solid ${C.green}44`,borderRadius:12,padding:"10px 14px",fontSize:13,color:C.green,textAlign:"center"}}>🎉 Referral applied — 10% off your first month!</div>}
      <div style={{display:"flex",background:C.surface,borderRadius:12,padding:4,gap:4}}>
        {["signin","signup"].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",background:mode===m?C.accent:"none",color:mode===m?C.bg:C.muted,border:"none",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"}}>{m==="signin"?"Sign In":"Create Account"}</button>)}
      </div>
      <Inp label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email"/>
      <Inp label="Password" value={pass} onChange={setPass} placeholder="Min 6 characters" type="password"/>
      {error&&<div style={{fontSize:12,color:error.startsWith("✅")?C.green:C.red,textAlign:"center"}}>{error}</div>}
      <Btn onClick={handleSubmit} disabled={loading}>{loading?"Loading...":(mode==="signin"?"SIGN IN →":"CREATE ACCOUNT →")}</Btn>
    </div>
  );
}

function PricingScreen({email,refCode,onBack}){
  const [plan,setPlan]=useState("monthly");
  const [loading,setLoading]=useState(false);
  const annualTotal=(9.99*12*0.90).toFixed(2);
  const annualPerMo=(9.99*0.90).toFixed(2);
  const firstMonth=refCode?(9.99*0.90).toFixed(2):"9.99";
  async function handleCheckout(){
    setLoading(true);
    await redirectToCheckout(plan==="monthly"?PRICE_MONTHLY:PRICE_ANNUAL,email,refCode);
    setLoading(false);
  }
  return(
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:16}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
      <div><div style={{fontSize:22,fontWeight:900}}>Choose Your Plan</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Full access. No free tier.</div></div>
      {refCode&&<div style={{background:C.green+"15",border:`1px solid ${C.green}44`,borderRadius:12,padding:"10px 14px",fontSize:13,color:C.green}}>🎉 Referral applied — 10% off your first month!</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{id:"monthly",label:"Monthly",price:`$${refCode?firstMonth:"9.99"}`,sub:refCode?"first month, $9.99 after":"per month"},
          {id:"annual",label:"Annual",price:`$${annualPerMo}/mo`,sub:`$${annualTotal}/yr · save 10%`,badge:"BEST VALUE"}].map(p=>(
          <div key={p.id} onClick={()=>setPlan(p.id)} style={{background:plan===p.id?C.accent+"22":C.card,border:`2px solid ${plan===p.id?C.accent:C.border}`,borderRadius:14,padding:"14px 12px",cursor:"pointer",position:"relative"}}>
            {p.badge&&<div style={{position:"absolute",top:-10,right:8,background:C.accent,color:C.bg,fontSize:10,fontWeight:900,borderRadius:20,padding:"2px 8px"}}>{p.badge}</div>}
            <div style={{fontWeight:700,fontSize:13,color:plan===p.id?C.accent:C.text}}>{p.label}</div>
            <div style={{fontSize:18,fontWeight:900,marginTop:4}}>{p.price}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{p.sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
        {["Unlimited deal scores","Full market overview","Community comps","Price alerts","VIN history reports","Referral rewards"].map(f=>(
          <div key={f} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
            <span style={{color:C.green}}>✓</span>{f}
          </div>
        ))}
      </div>
      <Btn onClick={handleCheckout} disabled={loading}>{loading?"Redirecting to Stripe...":"PAY WITH STRIPE →"}</Btn>
      <div style={{fontSize:11,color:C.muted,textAlign:"center"}}>Secured by Stripe · Cancel anytime</div>
    </div>
  );
}

function App({session}){
  const {token,userId,email,profile}=session;
  const [tab,setTab]=useState("scorer");
  const [vehicle,setVeh]=useState("");const [year,setYear]=useState("");
  const [condition,setCond]=useState("");const [mileage,setMile]=useState("");
  const [price,setPrice]=useState("");const [result,setResult]=useState(null);
  const [comps,setComps]=useState([]);const [compForm,setCF]=useState({vehicle:"",year:"",price:"",condition:"",mileage:"",location:""});
  const [compDone,setCD]=useState(false);const [copied,setCopied]=useState(false);
  const [loadingComps,setLC]=useState(false);
  const [scorerSubmitted,setScorerSubmitted]=useState(false);
  const [liveMarket,setLiveMarket]=useState(null);
  const [liveLoading,setLiveLoading]=useState(false);
  const refLink=`${window.location.origin}?ref=${profile?.referral_code||""}`;
  useEffect(()=>{if(tab==="comps")loadComps();},[tab]);
  async function loadComps(){setLC(true);try{const d=await sb.getComps(token);setComps(d||[]);}catch(e){console.error(e);}setLC(false);}
  async function submitComp(){
    if(!compForm.vehicle||!compForm.year||!compForm.price||!compForm.condition||!compForm.mileage)return;
    try{await sb.insertComp({user_id:userId,vehicle:compForm.vehicle,year:compForm.year,price:parseFloat(compForm.price.replace(/,/g,"")),condition:compForm.condition,mileage:compForm.mileage,location:compForm.location||"N/A"},token);
    setCF({vehicle:"",year:"",price:"",condition:"",mileage:"",location:""});setCD(true);setTimeout(()=>setCD(false),3000);loadComps();}
    catch(e){alert("Error: "+e.message);}
  }
  async function runScorer(){
    if(!vehicle||!condition||!mileage||!price||!year) return;
    const asked = parseFloat(price.replace(/,/g,""));
    setLiveMarket(null);
    if(MARKET_DATA[vehicle]){
      setResult(scoreDeals(MARKET_DATA[vehicle],asked,condition,mileage,year));
    } else {
      // Unknown vehicle — fetch live MarketCheck data
      setLiveLoading(true);
      setResult(null);
      try {
        const parts = vehicle.trim().split(/\s+/);
        const make = parts[0];
        const model = parts.slice(1).join(' ') || parts[0];
        const r = await fetch('/api/market-price', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({make, model, year})
        });
        const data = await r.json();
        setLiveMarket(data);
        if(data.found && data.median){
          const syntheticMarket = {
            base: data.median,
            trend: 2.0,
            supply: data.count > 10 ? 'Medium' : data.count > 4 ? 'Low' : 'Very Low',
            hot: false,
          };
          setResult(scoreDeals(syntheticMarket, asked, condition, mileage, year));
        } else {
          setResult({noData:true});
        }
      } catch(e) {
        console.error(e);
        setResult({noData:true});
      }
      setLiveLoading(false);
    }
  }
  function copyRef(){navigator.clipboard.writeText(refLink).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2500);}
  const tabs=[{id:"scorer",label:"Scorer"},{id:"market",label:"Market"},{id:"comps",label:"Comps"},{id:"referral",label:"Refer"},{id:"account",label:"Account"}];
  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:80}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 20px",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{background:C.accent,color:C.bg,fontWeight:900,fontSize:13,borderRadius:6,padding:"2px 8px"}}>REV</span>
            <span style={{fontWeight:800,fontSize:18}}>METRICS</span>
          </div>
          <Tag color={profile?.plan==="annual"?C.green:C.accent}>{profile?.plan==="annual"?"ANNUAL":"MONTHLY"}</Tag>
        </div>
      </div>
      <div style={{display:"flex",background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 2px",background:"none",border:"none",color:tab===t.id?C.accent:C.muted,fontWeight:tab===t.id?700:500,fontSize:11,cursor:"pointer",borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent"}}>{t.label}</button>)}
      </div>
      <div style={{padding:"20px 16px"}}>
        {tab==="scorer"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><h2 style={{margin:0,fontSize:20,fontWeight:800}}>Deal Scorer</h2><p style={{margin:"4px 0 0",fontSize:13,color:C.muted}}>Instant market intelligence on any listing.</p></div>
            <VehicleSearch label="Vehicle" value={vehicle} onChange={v=>{setVeh(v);setResult(null);}} options={Object.keys(MARKET_DATA)} error={scorerSubmitted&&!vehicle}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Year" value={year} onChange={setYear} placeholder="2004"/><Inp label="Asking Price ($)" value={price} onChange={setPrice} placeholder="28000"/></div>
            <Sel label="Condition" value={condition} onChange={setCond} options={CONDITIONS}/>
            <Sel label="Mileage" value={mileage} onChange={setMile} options={MILE_BRACKETS}/>
            <Btn onClick={runScorer} disabled={!vehicle||!condition||!mileage||!price||!year}>SCORE THIS DEAL →</Btn>
            {result&&result.noData&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:24,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:12}}>📊</div>
                <div style={{fontSize:16,fontWeight:800,marginBottom:8}}>Not Enough Auction Data</div>
                <div style={{fontSize:13,color:C.muted,marginBottom:16}}>This vehicle doesn't appear frequently on collector auction platforms. Try searching on a general marketplace instead.</div>
                <a href={`https://www.cars.com/shopping/results/?keyword=${encodeURIComponent(vehicle)}`} target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-block",background:C.accent,color:C.bg,borderRadius:10,padding:"10px 20px",fontWeight:800,fontSize:13,textDecoration:"none"}}>
                  Search on Cars.com →
                </a>
              </div>
            )}
            {result&&!result.noData&&(
              <div style={{background:C.card,border:`2px solid ${result.color}44`,borderRadius:16,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <Tag color={result.color}>{result.label}</Tag>
                      {liveMarket?.found && <span style={{fontSize:10,background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`,borderRadius:6,padding:"2px 8px",fontWeight:700}}>📡 LIVE · {liveMarket.count} listings</span>}
                    </div>
                    <div style={{fontSize:26,fontWeight:900,marginTop:10,color:result.color}}>{result.diff>=0?"+":""}{result.diff}% vs market</div></div><div style={{fontSize:13,color:C.muted,marginTop:4}}>{result.summary}</div></div>
                  <Gauge score={result.score} color={result.color}/>
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,marginTop:16,paddingTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {liveMarket?.found && (
                    <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:"10px 12px",gridColumn:"1/-1",marginBottom:4}}>
                      <div style={{fontSize:10,color:C.green,textTransform:"uppercase",letterSpacing:.8,fontWeight:700}}>Live Listing Range ({liveMarket.count} active)</div>
                      <div style={{fontSize:13,fontWeight:700,marginTop:4,color:C.text}}>${liveMarket.low?.toLocaleString()} – ${liveMarket.high?.toLocaleString()} <span style={{color:C.muted,fontWeight:400}}>avg ${liveMarket.avg?.toLocaleString()}</span></div>
                    </div>
                  )}
                  {[["Fair Market Value",`$${result.fair.toLocaleString()}`],["Asking Price",`$${parseFloat(price.replace(/,/g,"")).toLocaleString()}`],["Difference",result.diff>=0?`Save $${Math.abs(result.fair-parseFloat(price.replace(/,/g,""))).toLocaleString()}`:`Over $${Math.abs(result.fair-parseFloat(price.replace(/,/g,""))).toLocaleString()}`],["YoY Trend",`▲ ${MARKET_DATA[vehicle]?.trend}%`]].map(([k,v])=>(
                    <div key={k} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{k}</div><div style={{fontSize:14,fontWeight:700,marginTop:4}}>{v}</div></div>
                  ))}
                </div>
                <div style={{marginTop:12,background:C.accent+"11",border:`1px solid ${C.accent}33`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.accent}}>
                  💡 Supply for {vehicle} is <strong>{MARKET_DATA[vehicle]?.supply}</strong> — {["Very Low","Low"].includes(MARKET_DATA[vehicle]?.supply)?"don't wait if the price is right.":"you have negotiating room."}
                  <a href={batLink(vehicle)} target="_blank" rel="noopener noreferrer"
                    style={{display:"block",marginTop:6,color:C.accent,fontSize:11,opacity:0.75,textDecoration:"underline"}}>
                    View recent BaT sold listings →
                  </a>
                </div>
                <a href={batLink(vehicle)} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:10,
                    background:"transparent",border:`1px solid ${C.accent}`,borderRadius:10,
                    padding:"12px 14px",color:C.accent,fontSize:13,fontWeight:700,textDecoration:"none",
                    letterSpacing:.3}}>
                  🔨 See Real Sold Comps on Bring a Trailer
                </a>
              </div>
            )}
          </div>
        )}
        {tab==="market"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>Market Overview</h2>
            <p style={{margin:"0 0 8px",fontSize:13,color:C.muted}}>Fair values & trends across all tracked models.</p>
            {Object.entries(MARKET_DATA).map(([name,d])=>(
              <div key={name} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700}}>{name}</span>{d.hot&&<Tag color={C.accent}>🔥 Hot</Tag>}</div>
                <div style={{fontSize:22,fontWeight:900,color:C.accent,marginTop:6}}>${d.base.toLocaleString()}</div>
                <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}><Tag color={C.green}>▲ {d.trend}% YoY</Tag><span style={{fontSize:11,color:C.muted}}>Supply: {d.supply}</span></div>
              </div>
            ))}
          </div>
        )}
        {tab==="comps"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>Community Comps</h2>
            <p style={{margin:"0 0 4px",fontSize:13,color:C.muted}}>Real transactions from RevMetrics subscribers.</p>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
              <div style={{fontSize:12,color:C.accent,fontWeight:700,marginBottom:12}}>+ Submit a Transaction</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <VehicleSearch label="Vehicle" value={compForm.vehicle} onChange={v=>setCF(p=>({...p,vehicle:v}))} options={Object.keys(MARKET_DATA)}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Year" value={compForm.year} onChange={v=>setCF(p=>({...p,year:v}))} placeholder="2004"/><Inp label="Sale Price" value={compForm.price} onChange={v=>setCF(p=>({...p,price:v}))} placeholder="28500"/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Sel label="Condition" value={compForm.condition} onChange={v=>setCF(p=>({...p,condition:v}))} options={CONDITIONS}/><Sel label="Mileage" value={compForm.mileage} onChange={v=>setCF(p=>({...p,mileage:v}))} options={MILE_BRACKETS}/></div>
                <Inp label="State" value={compForm.location} onChange={v=>setCF(p=>({...p,location:v}))} placeholder="CA"/>
                <Btn onClick={submitComp} disabled={!compForm.vehicle||!compForm.year||!compForm.price||!compForm.condition||!compForm.mileage}>{compDone?"✅ Saved!":"SUBMIT COMP"}</Btn>
              </div>
            </div>
            {loadingComps?<div style={{textAlign:"center",color:C.muted,padding:20}}>Loading...</div>
              :comps.length===0?<div style={{textAlign:"center",color:C.muted,padding:20}}>No comps yet — be the first!</div>
              :comps.map((c,i)=>(
                <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:700,fontSize:14}}>{c.year} {c.vehicle}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.condition} · {c.mileage} · {c.location}</div></div>
                  <div style={{fontSize:20,fontWeight:800,color:C.accent}}>${Number(c.price).toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        )}
        {tab==="referral"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div><h2 style={{margin:0,fontSize:20,fontWeight:800}}>Refer a Friend</h2><p style={{margin:"4px 0 0",fontSize:13,color:C.muted}}>Both of you get rewarded.</p></div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
              {[["🔗","Share your link","Send your unique link to a friend"],["🎉","Friend subscribes","They get 10% off their first month"],["💰","You get rewarded","You get 10% off your next month"]].map(([icon,title,sub])=>(
                <div key={title} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:20}}>{icon}</span><div><div style={{fontWeight:700,fontSize:13}}>{title}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{sub}</div></div></div>
              ))}
            </div>
            <div style={{background:`linear-gradient(135deg,${C.accent}18,${C.accent}06)`,border:`1px solid ${C.accent}44`,borderRadius:14,padding:18}}>
              <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:.8}}>YOUR REFERRAL LINK</div>
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:12,color:C.accent,wordBreak:"break-all",marginBottom:12}}>{refLink}</div>
              <button onClick={copyRef} style={{background:copied?C.green:C.accent,color:C.bg,border:"none",borderRadius:10,padding:"12px",width:"100%",fontWeight:800,fontSize:14,cursor:"pointer",transition:"background .3s"}}>{copied?"✅ COPIED!":"COPY REFERRAL LINK"}</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Your Code",profile?.referral_code||"—"],["Credits Earned",profile?.referral_credits||0],["Status","Active"],["Plan",profile?.plan||"monthly"]].map(([k,v])=>(
                <div key={k} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{k}</div><div style={{fontSize:16,fontWeight:800,marginTop:4,color:C.accent}}>{v}</div></div>
              ))}
            </div>
          </div>
        )}
        {tab==="account"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <h2 style={{margin:0,fontSize:20,fontWeight:800}}>Account</h2>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18}}>
              {[["Email",email],["Plan",profile?.plan==="annual"?"Annual (10% off)":"Monthly"],["Referral code",profile?.referral_code||"—"],["Referral credits",profile?.referral_credits||0]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>
              ))}
            </div>
            <button onClick={()=>window.location.reload()} style={{background:"none",border:`1px solid ${C.red}44`,borderRadius:10,padding:"12px",color:C.red,fontSize:13,cursor:"pointer"}}>Sign Out</button>
          </div>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"12px 2px 10px",background:"none",border:"none",color:tab===t.id?C.accent:C.muted,fontWeight:tab===t.id?700:500,fontSize:10,cursor:"pointer",textTransform:"uppercase",borderTop:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent"}}>{t.label}</button>)}
      </div>
    </div>
  );
}

export default function Root(){
  const [session,setSession]=useState(null);
  const [screen,setScreen]=useState("auth");
  const [refCode,setRefCode]=useState("");
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    const ref=p.get("ref");const status=p.get("session");
    if(ref)setRefCode(ref);
    if(status==="success"&&session)setScreen("app");
  },[session]);
  function handleAuth(sess){
    setSession(sess);
    if(sess.profile?.plan&&sess.profile.plan!=="none")setScreen("app");
    else setScreen("pricing");
  }
  const Header=()=>(<div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"20px 20px 16px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{background:C.accent,color:C.bg,fontWeight:900,fontSize:13,borderRadius:6,padding:"2px 8px"}}>REV</span><span style={{fontWeight:800,fontSize:18}}>METRICS</span></div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Collector Car Intelligence</div></div>);
  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto"}}>
      {screen==="auth"&&<><Header/><AuthScreen onAuth={handleAuth} refCode={refCode}/></>}
      {screen==="pricing"&&session&&<><Header/><PricingScreen email={session.email} refCode={refCode} onBack={()=>setScreen("auth")}/></>}
      {screen==="app"&&session&&<App session={session}/>}
      {screen==="app"&&!session&&<><Header/><AuthScreen onAuth={handleAuth} refCode={refCode}/></>}
    </div>
  );
}