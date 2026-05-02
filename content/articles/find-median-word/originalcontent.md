# Find The Median Word

## 1. 介紹

Building on a previous word counting MapReduce example, this article demonstrates how to calculate the "median word"—a word whose frequency count falls at the median position.

## 2. 程式邏輯與實作

Two-job MapReduce: first job counts word frequencies, second job exchanges keys and values.

See content.tsx for full Java implementation.
