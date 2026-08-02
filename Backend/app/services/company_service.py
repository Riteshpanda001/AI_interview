from bson import ObjectId

class CompanyService:
    @staticmethod
    async def get_companies(db) -> list:
        # Check if company data exists
        count = await db["companies"].count_documents({})
        if count == 0:
            # Seed standard companies
            companies_list = [
                {
                    "name": "Google",
                    "slug": "google",
                    "description": "Tech giant specializing in search, cloud computing, and AI systems.",
                    "industry": "Technology",
                    "interview_process": [
                        {"round_name": "Online Assessment", "details": "Coding challenges on data structures and algorithms."},
                        {"round_name": "Technical Phone Screen", "details": "Algorithm discussion and basic algorithmic complexity checking."},
                        {"round_name": "Onsite Rounds", "details": "3 coding sessions, 1 system design, and 1 behavioral (Googlyness) interview."}
                    ],
                    "typical_questions": [
                        {"question": "Implement an LRU Cache.", "type": "technical"},
                        {"question": "How do you handle conflict in a software engineering team?", "type": "behavioral"}
                    ]
                },
                {
                    "name": "Meta",
                    "slug": "meta",
                    "description": "Social media and metaverse pioneer focusing on virtual systems and social graphs.",
                    "industry": "Social Media / VR",
                    "interview_process": [
                        {"round_name": "Screening", "details": "Rapid questions on algorithm efficiency."},
                        {"round_name": "Onsite Loops", "details": "System design, product design, and system reliability checking."}
                    ],
                    "typical_questions": [
                        {"question": "Design a news feed delivery service.", "type": "technical"}
                    ]
                }
            ]
            await db["companies"].insert_many(companies_list)
            
        cursor = db["companies"].find({})
        companies = await cursor.to_list(length=100)
        for comp in companies:
            comp["id"] = str(comp["_id"])
        return companies

    @staticmethod
    async def get_company_dsa_questions(company_name: str, db) -> list:
        # Structured company-wise DSA questions catalog
        COMPANY_DSA_DATA = {
            "google": [
                {
                    "id": "goog-lru-cache",
                    "title": "LRU Cache",
                    "difficulty": "Hard",
                    "topic": "Design / Linked List",
                    "acceptance": "34.2%",
                    "company": "Google",
                    "instructions": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.",
                    "codeTemplate": "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map();\n  }\n  get(key) {\n    if(!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if(this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if(this.map.size > this.capacity) {\n      const firstKey = this.map.keys().next().value;\n      this.map.delete(firstKey);\n    }\n  }\n}"
                },
                {
                    "id": "goog-median-sorted-arrays",
                    "title": "Median of Two Sorted Arrays",
                    "difficulty": "Hard",
                    "topic": "Binary Search",
                    "acceptance": "36.5%",
                    "company": "Google",
                    "instructions": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log (m+n)) complexity.",
                    "codeTemplate": "function findMedianSortedArrays(nums1, nums2) {\n  const merged = [...nums1, ...nums2].sort((a, b) => a - b);\n  const mid = Math.floor(merged.length / 2);\n  if(merged.length % 2 === 0) {\n    return (merged[mid - 1] + merged[mid]) / 2;\n  }\n  return merged[mid];\n}"
                },
                {
                    "id": "goog-course-schedule",
                    "title": "Course Schedule (Graph Cycle)",
                    "difficulty": "Medium",
                    "topic": "Graph / Topological Sort",
                    "acceptance": "45.8%",
                    "company": "Google",
                    "instructions": "There are numCourses courses. Return true if you can finish all courses given prerequisites [a, b] using Topological Sort or DFS cycle detection.",
                    "codeTemplate": "function canFinish(numCourses, prerequisites) {\n  const adj = Array.from({length: numCourses}, () => []);\n  const visited = new Array(numCourses).fill(0);\n  for(let [u, v] of prerequisites) adj[v].push(u);\n  function dfs(curr) {\n    if(visited[curr] === 1) return true;\n    if(visited[curr] === 2) return false;\n    visited[curr] = 1;\n    for(let nxt of adj[curr]) {\n      if(dfs(nxt)) return true;\n    }\n    visited[curr] = 2;\n    return false;\n  }\n  for(let i = 0; i < numCourses; i++) {\n    if(dfs(i)) return false;\n  }\n  return true;\n}"
                }
            ],
            "amazon": [
                {
                    "id": "amzn-buy-sell-stock",
                    "title": "Best Time to Buy and Sell Stock",
                    "difficulty": "Easy",
                    "topic": "Array / Dynamic Programming",
                    "acceptance": "52.4%",
                    "company": "Amazon",
                    "instructions": "Given an array prices where prices[i] is the price of a given stock on the ith day, maximize your profit by choosing a single day to buy and a future day to sell.",
                    "codeTemplate": "function maxProfit(prices) {\n  let minPrice = Infinity, maxProf = 0;\n  for(let p of prices) {\n    if(p < minPrice) minPrice = p;\n    else if(p - minPrice > maxProf) maxProf = p - minPrice;\n  }\n  return maxProf;\n}"
                },
                {
                    "id": "amzn-trapping-rain-water",
                    "title": "Trapping Rain Water",
                    "difficulty": "Hard",
                    "topic": "Two Pointers / Stack",
                    "acceptance": "42.1%",
                    "company": "Amazon",
                    "instructions": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
                    "codeTemplate": "function trap(height) {\n  let left = 0, right = height.length - 1;\n  let maxL = 0, maxR = 0, water = 0;\n  while(left < right) {\n    if(height[left] < height[right]) {\n      if(height[left] >= maxL) maxL = height[left];\n      else water += maxL - height[left];\n      left++;\n    } else {\n      if(height[right] >= maxR) maxR = height[right];\n      else water += maxR - height[right];\n      right--;\n    }\n  }\n  return water;\n}"
                }
            ],
            "meta": [
                {
                    "id": "meta-subarray-sum-k",
                    "title": "Subarray Sum Equals K",
                    "difficulty": "Medium",
                    "topic": "Array / Hash Map",
                    "acceptance": "43.7%",
                    "company": "Meta",
                    "instructions": "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.",
                    "codeTemplate": "function subarraySum(nums, k) {\n  let count = 0, sum = 0;\n  const map = new Map();\n  map.set(0, 1);\n  for(let n of nums) {\n    sum += n;\n    if(map.has(sum - k)) count += map.get(sum - k);\n    map.set(sum, (map.get(sum) || 0) + 1);\n  }\n  return count;\n}"
                }
            ]
        }

        key = (company_name or "google").lower().strip()
        return COMPANY_DSA_DATA.get(key, COMPANY_DSA_DATA["google"])
