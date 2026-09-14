"""
Seed Script — Coding Problems
==============================
Populates the MongoDB `coding_problems` collection from the
curated problem list in the frontend CodingProblems.jsx.

Usage:
    cd Backend
    python seed_coding_problems.py

Requirements:
    - MongoDB running (local or Atlas)
    - .env file with MONGODB_URL configured
"""

import asyncio
import os
import sys

# Ensure the Backend/ folder is on the path
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "ai_interview_db")

# ── Curated Problems (mirrored from CodingProblems.jsx) ──────────────────────
PROBLEMS = [
    # ── Arrays ────────────────────────────────────────────────────────────────
    {
        "slug": "arr-linear-search",
        "title": "Linear Search",
        "difficulty": "Easy",
        "category": "Array",
        "acceptance": "45.1%",
        "companies": ["Wipro", "TCS"],
        "description": "Given an array arr of N elements and a value X, search if X is present in the array or not. Return 0-based index if found, else return -1.",
        "starter_code": {
            "python": "def search(arr, N, X):\n    for i in range(N):\n        if arr[i] == X:\n            return i\n    return -1",
            "javascript": "function search(arr, N, X) {\n  for(let i = 0; i < N; i++) {\n    if(arr[i] === X) return i;\n  }\n  return -1;\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nint search(vector<int>& arr, int N, int X) {\n    for(int i = 0; i < N; i++)\n        if(arr[i] == X) return i;\n    return -1;\n}",
            "java": "public int search(int[] arr, int N, int X) {\n    for(int i = 0; i < N; i++)\n        if(arr[i] == X) return i;\n    return -1;\n}"
        },
        "public_test_cases": [
            {"input": "5, 3, 9, 1, 7\n5\n9", "expected_output": "2"},
            {"input": "1, 2, 3, 4\n4\n5", "expected_output": "-1"}
        ],
        "hidden_test_cases": [
            {"input": "10, 20, 30, 40\n4\n10", "expected_output": "0"},
            {"input": "7, 8, 9\n3\n8", "expected_output": "1"}
        ]
    },
    {
        "slug": "arr-binary-search",
        "title": "Binary Search",
        "difficulty": "Easy",
        "category": "Array",
        "acceptance": "55.3%",
        "companies": ["Google", "Apple", "Amazon"],
        "description": "Given a sorted array of integers arr and a target value k, return its index. If target is not found, return -1 in O(log N) runtime complexity.",
        "starter_code": {
            "python": "def binarysearch(arr, n, k):\n    left, right = 0, n - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == k: return mid\n        if arr[mid] < k: left = mid + 1\n        else: right = mid - 1\n    return -1",
            "javascript": "function binarysearch(arr, n, k) {\n  let left = 0, right = n - 1;\n  while(left <= right) {\n    let mid = Math.floor((left + right)/2);\n    if(arr[mid] === k) return mid;\n    if(arr[mid] < k) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
            "cpp": "#include <vector>\nusing namespace std;\nint binarysearch(vector<int>& arr, int n, int k) {\n    int l=0, r=n-1;\n    while(l<=r){\n        int m=(l+r)/2;\n        if(arr[m]==k) return m;\n        if(arr[m]<k) l=m+1;\n        else r=m-1;\n    }\n    return -1;\n}",
            "java": "public int binarySearch(int[] arr, int n, int k) {\n    int l=0, r=n-1;\n    while(l<=r){\n        int m=(l+r)/2;\n        if(arr[m]==k) return m;\n        if(arr[m]<k) l=m+1;\n        else r=m-1;\n    }\n    return -1;\n}"
        },
        "public_test_cases": [
            {"input": "1, 3, 5, 7, 9\n5\n5", "expected_output": "2"},
            {"input": "2, 4, 6, 8\n4\n3", "expected_output": "-1"}
        ],
        "hidden_test_cases": [
            {"input": "1, 2, 3, 4, 5\n5\n1", "expected_output": "0"},
            {"input": "10, 20, 30\n3\n30", "expected_output": "2"}
        ]
    },
    {
        "slug": "arr-reverse",
        "title": "Reverse an Array",
        "difficulty": "Easy",
        "category": "Array",
        "acceptance": "65.8%",
        "companies": ["Meta", "Adobe"],
        "description": "Given an array, reverse its elements in-place using constant auxiliary space O(1).",
        "starter_code": {
            "python": "def reverseArray(arr):\n    left, right = 0, len(arr)-1\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n    return arr",
            "javascript": "function reverseArray(arr) {\n  let left = 0, right = arr.length - 1;\n  while(left < right) {\n    let temp = arr[left]; arr[left] = arr[right]; arr[right] = temp;\n    left++; right--;\n  }\n  return arr;\n}",
            "cpp": "#include <vector>\nusing namespace std;\nvector<int> reverseArray(vector<int>& arr) {\n    int l=0, r=arr.size()-1;\n    while(l<r) { swap(arr[l++], arr[r--]); }\n    return arr;\n}",
            "java": "public int[] reverseArray(int[] arr) {\n    int l=0, r=arr.length-1;\n    while(l<r){ int t=arr[l]; arr[l]=arr[r]; arr[r]=t; l++; r--; }\n    return arr;\n}"
        },
        "public_test_cases": [
            {"input": "1, 2, 3, 4, 5", "expected_output": "[5, 4, 3, 2, 1]"},
            {"input": "10, 20, 30", "expected_output": "[30, 20, 10]"}
        ],
        "hidden_test_cases": [
            {"input": "1", "expected_output": "[1]"},
            {"input": "5, 1, 4, 2, 8", "expected_output": "[8, 2, 4, 1, 5]"}
        ]
    },
    {
        "slug": "arr-min-max",
        "title": "Find Min/Max in Array",
        "difficulty": "Easy",
        "category": "Array",
        "acceptance": "70.2%",
        "companies": ["Amazon", "Goldman Sachs"],
        "description": "Given an array arr, find the minimum and maximum elements using a minimal number of comparisons.",
        "starter_code": {
            "python": "def getMinMax(arr, n):\n    mn, mx = arr[0], arr[0]\n    for i in range(1, n):\n        if arr[i] < mn: mn = arr[i]\n        if arr[i] > mx: mx = arr[i]\n    return [mn, mx]",
            "javascript": "function getMinMax(arr, n) {\n  let min = arr[0], max = arr[0];\n  for(let i = 1; i < n; i++) {\n    if(arr[i] < min) min = arr[i];\n    if(arr[i] > max) max = arr[i];\n  }\n  return [min, max];\n}",
            "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\npair<int,int> getMinMax(vector<int>& arr){\n    return {*min_element(arr.begin(),arr.end()), *max_element(arr.begin(),arr.end())};\n}",
            "java": "public int[] getMinMax(int[] arr) {\n    int mn=arr[0], mx=arr[0];\n    for(int x: arr){ mn=Math.min(mn,x); mx=Math.max(mx,x); }\n    return new int[]{mn,mx};\n}"
        },
        "public_test_cases": [
            {"input": "3, 1, 4, 1, 5, 9, 2, 6", "expected_output": "[1, 9]"},
            {"input": "7, 7, 7", "expected_output": "[7, 7]"}
        ],
        "hidden_test_cases": [
            {"input": "-5, 0, 5", "expected_output": "[-5, 5]"},
            {"input": "100", "expected_output": "[100, 100]"}
        ]
    },
    # ── Linked Lists ──────────────────────────────────────────────────────────
    {
        "slug": "ll-reverse",
        "title": "Reverse a Linked List",
        "difficulty": "Easy",
        "category": "Linked Lists",
        "acceptance": "74.2%",
        "companies": ["Google", "Meta", "Amazon"],
        "description": "Given the head of a singly linked list, reverse the list in-place and return the new head node.",
        "starter_code": {
            "python": "def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev",
            "javascript": "function reverseList(head) {\n  let prev = null, curr = head;\n  while(curr) {\n    let next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}",
            "cpp": "ListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    while(head) {\n        ListNode* nxt = head->next;\n        head->next = prev;\n        prev = head;\n        head = nxt;\n    }\n    return prev;\n}",
            "java": "public ListNode reverseList(ListNode head) {\n    ListNode prev = null;\n    while(head != null) {\n        ListNode nxt = head.next;\n        head.next = prev;\n        prev = head;\n        head = nxt;\n    }\n    return prev;\n}"
        },
        "public_test_cases": [],
        "hidden_test_cases": []
    },
    # ── Two Sum ───────────────────────────────────────────────────────────────
    {
        "slug": "two-sum",
        "title": "Two Sum",
        "difficulty": "Easy",
        "category": "Array",
        "acceptance": "49.8%",
        "companies": ["Google", "Amazon", "Meta", "Microsoft"],
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
        "starter_code": {
            "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in seen:\n                return [seen[diff], i]\n            seen[n] = i\n        return []",
            "javascript": "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}",
            "cpp": "#include <vector>\n#include <unordered_map>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> seen;\n    for(int i=0;i<nums.size();i++){\n        int diff=target-nums[i];\n        if(seen.count(diff)) return {seen[diff],i};\n        seen[nums[i]]=i;\n    }\n    return {};\n}",
            "java": "import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer,Integer> map = new HashMap<>();\n        for(int i=0;i<nums.length;i++){\n            int diff=target-nums[i];\n            if(map.containsKey(diff)) return new int[]{map.get(diff),i};\n            map.put(nums[i],i);\n        }\n        return new int[]{};\n    }\n}"
        },
        "public_test_cases": [
            {"input": "2, 7, 11, 15\n9", "expected_output": "[0, 1]"},
            {"input": "3, 2, 4\n6", "expected_output": "[1, 2]"}
        ],
        "hidden_test_cases": [
            {"input": "3, 3\n6", "expected_output": "[0, 1]"},
            {"input": "1, 5, 8, 3\n11", "expected_output": "[2, 3]"}
        ]
    },
    # ── Dynamic Programming ───────────────────────────────────────────────────
    {
        "slug": "max-subarray",
        "title": "Maximum Subarray (Kadane's Algorithm)",
        "difficulty": "Medium",
        "category": "Dynamic Programming",
        "acceptance": "49.6%",
        "companies": ["Amazon", "Microsoft", "Google"],
        "description": "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.",
        "starter_code": {
            "python": "def maxSubArray(nums):\n    max_sum = nums[0]\n    curr = nums[0]\n    for n in nums[1:]:\n        curr = max(n, curr + n)\n        max_sum = max(max_sum, curr)\n    return max_sum",
            "javascript": "function maxSubArray(nums) {\n  let maxSum = nums[0], curr = nums[0];\n  for(let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxSum = Math.max(maxSum, curr);\n  }\n  return maxSum;\n}",
            "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\nint maxSubArray(vector<int>& nums) {\n    int mx=nums[0], cur=nums[0];\n    for(int i=1;i<nums.size();i++){ cur=max(nums[i],cur+nums[i]); mx=max(mx,cur); }\n    return mx;\n}",
            "java": "public int maxSubArray(int[] nums) {\n    int mx=nums[0], cur=nums[0];\n    for(int i=1;i<nums.length;i++){ cur=Math.max(nums[i],cur+nums[i]); mx=Math.max(mx,cur); }\n    return mx;\n}"
        },
        "public_test_cases": [
            {"input": "-2, 1, -3, 4, -1, 2, 1, -5, 4", "expected_output": "6"},
            {"input": "1", "expected_output": "1"}
        ],
        "hidden_test_cases": [
            {"input": "5, 4, -1, 7, 8", "expected_output": "23"},
            {"input": "-1, -2, -3", "expected_output": "-1"}
        ]
    },
    {
        "slug": "climbing-stairs",
        "title": "Climbing Stairs",
        "difficulty": "Easy",
        "category": "Dynamic Programming",
        "acceptance": "51.7%",
        "companies": ["Amazon", "Apple", "Google"],
        "description": "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
        "starter_code": {
            "python": "def climbStairs(n: int) -> int:\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n+1):\n        a, b = b, a + b\n    return b",
            "javascript": "function climbStairs(n) {\n  if(n <= 2) return n;\n  let a = 1, b = 2;\n  for(let i = 3; i <= n; i++) { [a, b] = [b, a + b]; }\n  return b;\n}",
            "cpp": "int climbStairs(int n) {\n    if(n<=2) return n;\n    int a=1,b=2;\n    for(int i=3;i<=n;i++){int t=a+b;a=b;b=t;}\n    return b;\n}",
            "java": "public int climbStairs(int n) {\n    if(n<=2) return n;\n    int a=1,b=2;\n    for(int i=3;i<=n;i++){int t=a+b;a=b;b=t;}\n    return b;\n}"
        },
        "public_test_cases": [
            {"input": "2", "expected_output": "2"},
            {"input": "3", "expected_output": "3"}
        ],
        "hidden_test_cases": [
            {"input": "1", "expected_output": "1"},
            {"input": "5", "expected_output": "8"}
        ]
    },
    # ── Stack ─────────────────────────────────────────────────────────────────
    {
        "slug": "valid-parentheses",
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "category": "Stack",
        "acceptance": "40.7%",
        "companies": ["Google", "Meta", "Amazon", "Microsoft"],
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "starter_code": {
            "python": "def isValid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[c] != top: return False\n        else:\n            stack.append(c)\n    return not stack",
            "javascript": "function isValid(s) {\n  const stack = [], map = {')':'(','}':'{',']':'['};\n  for(const c of s) {\n    if(map[c]) { if(stack.pop() !== map[c]) return false; }\n    else stack.push(c);\n  }\n  return stack.length === 0;\n}",
            "cpp": "#include <stack>\n#include <string>\nusing namespace std;\nbool isValid(string s) {\n    stack<char> st;\n    for(char c: s){\n        if(c=='('||c=='{'||c=='[') st.push(c);\n        else {\n            if(st.empty()) return false;\n            char t=st.top(); st.pop();\n            if((c==')'&&t!='(')||(c=='}'&&t!='{')||(c==']'&&t!='[')) return false;\n        }\n    }\n    return st.empty();\n}",
            "java": "import java.util.*;\npublic boolean isValid(String s) {\n    Deque<Character> st = new ArrayDeque<>();\n    for(char c: s.toCharArray()){\n        if(c=='('||c=='{'||c=='[') st.push(c);\n        else {\n            if(st.isEmpty()) return false;\n            char t=st.pop();\n            if((c==')'&&t!='(')||(c=='}'&&t!='{')||(c==']'&&t!='[')) return false;\n        }\n    }\n    return st.isEmpty();\n}"
        },
        "public_test_cases": [
            {"input": "()", "expected_output": "True"},
            {"input": "()[]{}", "expected_output": "True"},
            {"input": "(]", "expected_output": "False"}
        ],
        "hidden_test_cases": [
            {"input": "([)]", "expected_output": "False"},
            {"input": "{[]}", "expected_output": "True"}
        ]
    },
]


async def seed():
    print(f"\n🚀 Connecting to MongoDB: {MONGODB_URL} / {DB_NAME}")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    collection = db["coding_problems"]

    inserted = 0
    skipped = 0

    for problem in PROBLEMS:
        existing = await collection.find_one({"slug": problem["slug"]})
        if existing:
            print(f"  ⏭  Skipped (already exists): {problem['title']}")
            skipped += 1
        else:
            problem["created_at"] = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
            await collection.insert_one(problem)
            print(f"  ✅ Inserted: {problem['title']}  [{problem['difficulty']}]")
            inserted += 1

    print(f"\n✨ Seeding complete: {inserted} inserted, {skipped} skipped.\n")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
