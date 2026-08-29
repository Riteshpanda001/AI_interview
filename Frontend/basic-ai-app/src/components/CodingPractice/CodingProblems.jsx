import React, { useState } from "react";
import "./CodingProblems.css";
import useRequireAuth from "../../hooks/useRequireAuth";

// Sample Problems Database
const PROBLEMS = [
  {
    id: "time-space-mcq",
    title: "Time & Space Complexity MCQ",
    difficulty: "Easy",
    category: "Time & Space Complexity",
    acceptance: "85.4%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "Evaluate and practice your knowledge on Time and Space complexities of basic operations including looping, recursion, and searching methods.",
    codeTemplate: `// Practice Test on Time & Space Complexity.
// Click the 'Official Practice' button to solve MCQs on the platform.`,
    practiceLink: "https://www.bosscoderacademy.com/practice-test/time-space-complexity-mcq-dsa"
  },
  {
    id: "arr-linear-search",
    title: "Linear Search",
    difficulty: "Easy",
    category: "Array",
    acceptance: "45.1%",
    companies: ["Wipro", "TCS"],
    status: "Unsolved",
    instructions: "Given an array arr of N elements and a value X, search if X is present in the array or not. Return 0-based index if found, else return -1.",
    codeTemplate: `function search(arr, N, X) {
  for(let i = 0; i < N; i++) {
    if(arr[i] === X) return i;
  }
  return -1;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/search-an-element-in-an-array-1587115621/1"
  },
  {
    id: "arr-binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Array",
    acceptance: "55.3%",
    companies: ["Google", "Apple", "Amazon"],
    status: "Unsolved",
    instructions: "Given a sorted array of integers arr and a target value k, return its index. If target is not found, return -1 in O(log N) runtime complexity.",
    codeTemplate: `function binarysearch(arr, n, k) {
  let left = 0, right = n - 1;
  while(left <= right) {
    let mid = Math.floor((left + right)/2);
    if(arr[mid] === k) return mid;
    if(arr[mid] < k) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/binary-search-1587115620/1"
  },
  {
    id: "arr-reverse",
    title: "Reverse an Array",
    difficulty: "Easy",
    category: "Array",
    acceptance: "65.8%",
    companies: ["Meta", "Adobe"],
    status: "Unsolved",
    instructions: "Given an array, reverse its elements in-place using constant auxiliary space O(1).",
    codeTemplate: `function reverseArray(arr) {
  let left = 0, right = arr.length - 1;
  while(left < right) {
    let temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
  }
  return arr;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/reverse-an-array/1"
  },
  {
    id: "arr-min-max",
    title: "Find Min/Max in Array",
    difficulty: "Easy",
    category: "Array",
    acceptance: "70.2%",
    companies: ["Amazon", "Goldman Sachs"],
    status: "Unsolved",
    instructions: "Given an array arr, find the minimum and maximum elements using a minimal number of comparisons.",
    codeTemplate: `function getMinMax(arr, n) {
  let min = arr[0], max = arr[0];
  for(let i = 1; i < n; i++) {
    if(arr[i] < min) min = arr[i];
    if(arr[i] > max) max = arr[i];
  }
  return [min, max];
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1"
  },
  {
    id: "arr-prefix-sum",
    title: "Basic Prefix Sum",
    difficulty: "Medium",
    category: "Array",
    acceptance: "48.7%",
    companies: ["Microsoft", "Uber"],
    status: "Unsolved",
    instructions: "Compute the prefix sums of a given array to allow fast range-sum updates or queries.",
    codeTemplate: `function prefixSum(arr) {
  let prefix = [];
  prefix[0] = arr[0];
  for(let i = 1; i < arr.length; i++) {
    prefix[i] = prefix[i-1] + arr[i];
  }
  return prefix;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/maximum-prefix-sum-for-a-given-range0227/1"
  },
  {
    id: "ll-insert-tail",
    title: "Insertion at Tail",
    difficulty: "Easy",
    category: "Linked Lists",
    acceptance: "52.4%",
    companies: ["Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Insert a node with value x at the end of a singly linked list.",
    codeTemplate: `function insertAtTail(head, x) {
  let newNode = { data: x, next: null };
  if(!head) return newNode;
  let curr = head;
  while(curr.next) {
    curr = curr.next;
  }
  curr.next = newNode;
  return head;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/linked-list-insertion-1587115620/1"
  },
  {
    id: "ll-delete-node",
    title: "Delete Given Node",
    difficulty: "Medium",
    category: "Linked Lists",
    acceptance: "75.1%",
    companies: ["Adobe", "Apple"],
    status: "Unsolved",
    instructions: "Delete a given node in a singly linked list. You will not have access to the head, only the node to be deleted.",
    codeTemplate: `function deleteNode(node) {
  node.val = node.next.val;
  node.next = node.next.next;
}`,
    practiceLink: "https://leetcode.com/problems/delete-node-in-a-linked-list/description/"
  },
  {
    id: "ll-reverse",
    title: "Reverse a Linked List",
    difficulty: "Easy",
    category: "Linked Lists",
    acceptance: "74.2%",
    companies: ["Google", "Meta", "Amazon"],
    status: "Unsolved",
    instructions: "Given the head of a singly linked list, reverse the list in-place and return the new head node.",
    codeTemplate: `function reverseList(head) {
  let prev = null, curr = head;
  while(curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
    practiceLink: "https://leetcode.com/problems/reverse-linked-list/description/"
  },
  {
    id: "ll-merge-sorted",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Linked Lists",
    acceptance: "62.1%",
    companies: ["Google", "Microsoft", "Tencent"],
    status: "Unsolved",
    instructions: "Merge two sorted singly linked lists and return it as a single sorted list recursively or iteratively.",
    codeTemplate: `function mergeTwoLists(list1, list2) {
  let dummy = { val: 0, next: null };
  let curr = dummy;
  while(list1 && list2) {
    if(list1.val <= list2.val) {
      curr.next = list1;
      list1 = list1.next;
    } else {
      curr.next = list2;
      list2 = list2.next;
    }
    curr = curr.next;
  }
  curr.next = list1 || list2;
  return dummy.next;
}`,
    practiceLink: "https://leetcode.com/problems/merge-two-sorted-lists/description"
  },
  {
    id: "stack-arr",
    title: "Implement Stack using Array",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "68.3%",
    companies: ["Samsung", "Oracle"],
    status: "Unsolved",
    instructions: "Implement push and pop operations of a stack using an internal array.",
    codeTemplate: `class MyStack {
  constructor() {
    this.arr = [];
  }
  push(x) {
    this.arr.push(x);
  }
  pop() {
    if(this.arr.length === 0) return -1;
    return this.arr.pop();
  }
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/implement-stack-using-array/1"
  },
  {
    id: "stack-ll",
    title: "Implement Stack using Linked List",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "58.2%",
    companies: ["Yahoo", "Cisco"],
    status: "Unsolved",
    instructions: "Implement push and pop operations of a stack using singly linked nodes.",
    codeTemplate: `class MyStack {
  constructor() {
    this.top = null;
  }
  push(x) {
    let node = { data: x, next: this.top };
    this.top = node;
  }
  pop() {
    if(!this.top) return -1;
    let val = this.top.data;
    this.top = this.top.next;
    return val;
  }
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/implement-stack-using-linked-list/1"
  },
  {
    id: "stack-valid-parens",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "41.0%",
    companies: ["Meta", "Apple", "Google"],
    status: "Unsolved",
    instructions: "Check if brackets in string s containing \'(\', \')\', \'{\', \'}\', \'[\' and \']\' close in the correct nested order.",
    codeTemplate: `function isValid(s) {
  let stack = [];
  for(let char of s) {
    if(char === '(') stack.push(')');
    else if(char === '{') stack.push('}');
    else if(char === '[') stack.push(']');
    else if(stack.length === 0 || stack.pop() !== char) return false;
  }
  return stack.length === 0;
}`,
    practiceLink: "https://leetcode.com/problems/valid-parentheses/description"
  },
  {
    id: "ll-palindrome",
    title: "Palindrome Linked List",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "51.4%",
    companies: ["Amazon", "Uber"],
    status: "Unsolved",
    instructions: "Verify if a singly linked list is a palindrome in O(N) time and O(1) space.",
    codeTemplate: `function isPalindrome(head) {
  let slow = head, fast = head;
  while(fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let prev = null, curr = slow;
  while(curr) {
    let temp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = temp;
  }
  let left = head, right = prev;
  while(right) {
    if(left.val !== right.val) return false;
    left = left.next;
    right = right.next;
  }
  return true;
}`,
    practiceLink: "https://leetcode.com/problems/palindrome-linked-list/description/"
  },
  {
    id: "queue-arr",
    title: "Implement Queue using Array",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "55.8%",
    companies: ["Flipkart", "Snapdeal"],
    status: "Unsolved",
    instructions: "Implement basic FIFO queue push and pop functions using an array.",
    codeTemplate: `class MyQueue {
  constructor() {
    this.arr = [];
    this.front = 0;
  }
  push(x) {
    this.arr.push(x);
  }
  pop() {
    if(this.front >= this.arr.length) return -1;
    return this.arr[this.front++];
  }
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/implement-queue-using-array/1"
  },
  {
    id: "queue-ll",
    title: "Implement Queue using Linked List",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "49.1%",
    companies: ["Adobe", "Paytm"],
    status: "Unsolved",
    instructions: "Implement basic queue properties using linked list node chains.",
    codeTemplate: `class MyQueue {
  constructor() {
    this.front = null;
    this.rear = null;
  }
  push(x) {
    let node = { data: x, next: null };
    if(!this.front) {
      this.front = this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
  }
  pop() {
    if(!this.front) return -1;
    let val = this.front.data;
    this.front = this.front.next;
    if(!this.front) this.rear = null;
    return val;
  }
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/implement-queue-using-linked-list/1"
  },
  {
    id: "queue-recent-calls",
    title: "Number of Recent Calls",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "73.4%",
    companies: ["Twitter", "LinkedIn"],
    status: "Unsolved",
    instructions: "Count requests made in the past 3000ms using a sliding queue.",
    codeTemplate: `class RecentCounter {
  constructor() {
    this.queue = [];
  }
  ping(t) {
    this.queue.push(t);
    while(this.queue[0] < t - 3000) {
      this.queue.shift();
    }
    return this.queue.length;
  }
}`,
    practiceLink: "https://leetcode.com/problems/number-of-recent-calls/description/"
  },
  {
    id: "str-palindrome-check",
    title: "Palindrome Check",
    difficulty: "Easy",
    category: "Strings",
    acceptance: "50.7%",
    companies: ["Paytm", "Accenture"],
    status: "Unsolved",
    instructions: "Verify if string S reads the same forwards and backwards, ignoring cases.",
    codeTemplate: `function isPalindrome(S) {
  let left = 0, right = S.length - 1;
  while(left < right) {
    if(S[left] !== S[right]) return 0;
    left++;
    right--;
  }
  return 1;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/palindrome-string0817/1"
  },
  {
    id: "str-manipulation",
    title: "Basic String Manipulation",
    difficulty: "Easy",
    category: "Strings",
    acceptance: "47.2%",
    companies: ["TCS", "Cognizant"],
    status: "Unsolved",
    instructions: "Reverse and perform basic manipulation steps on input string.",
    codeTemplate: `function manipulateString(s) {
  return s.split('').reverse().join('');
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/string-manipulation3706/1"
  },
  {
    id: "str-reverse",
    title: "Reverse String",
    difficulty: "Easy",
    category: "Strings",
    acceptance: "77.1%",
    companies: ["Meta", "Adobe"],
    status: "Unsolved",
    instructions: "Reverse a given string array in-place using O(1) space.",
    codeTemplate: `function reverseString(s) {
  let left = 0, right = s.length - 1;
  while(left < right) {
    let temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    left++;
    right--;
  }
}`,
    practiceLink: "https://leetcode.com/problems/reverse-string/description/"
  },
  {
    id: "str-lower-case",
    title: "To Lower Case",
    difficulty: "Easy",
    category: "Strings",
    acceptance: "83.6%",
    companies: ["Intel", "Sony"],
    status: "Unsolved",
    instructions: "Convert a given string into lowercase without calling internal string routines.",
    codeTemplate: `function toLowerCase(s) {
  let res = "";
  for(let char of s) {
    let code = char.charCodeAt(0);
    if(code >= 65 && code <= 90) {
      res += String.fromCharCode(code + 32);
    } else {
      res += char;
    }
  }
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/to-lower-case/description/"
  },
  {
    id: "search-in-arr",
    title: "Searching in an Array",
    difficulty: "Easy",
    category: "Searching",
    acceptance: "40.9%",
    companies: ["Wipro", "TCS"],
    status: "Unsolved",
    instructions: "Find the 1-based index of k in an unsorted array of n elements. Return -1 if not found.",
    codeTemplate: `function search(arr, n, k) {
  for(let i=0; i<n; i++) {
    if(arr[i] === k) return i + 1;
  }
  return -1;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/searching-a-number0324/1"
  },
  {
    id: "search-binary",
    title: "Search in a Sorted Array",
    difficulty: "Easy",
    category: "Searching",
    acceptance: "56.4%",
    companies: ["Google", "Meta"],
    status: "Unsolved",
    instructions: "Search target inside sorted list nums. Run in O(log n) time.",
    codeTemplate: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while(left <= right) {
    let mid = Math.floor((left + right)/2);
    if(nums[mid] === target) return mid;
    if(nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    practiceLink: "https://leetcode.com/problems/binary-search/description/"
  },
  {
    id: "search-missing",
    title: "Missing Number",
    difficulty: "Easy",
    category: "Searching",
    acceptance: "63.2%",
    companies: ["Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Identify the missing integer in range [0, n] from an array of size n.",
    codeTemplate: `function missingNumber(nums) {
  let n = nums.length;
  let expectedSum = (n * (n + 1)) / 2;
  let actualSum = nums.reduce((a, b) => a + b, 0);
  return expectedSum - actualSum;
}`,
    practiceLink: "https://leetcode.com/problems/missing-number/description/"
  },
  {
    id: "sort-insert",
    title: "Insertion Sort",
    difficulty: "Easy",
    category: "Sorting",
    acceptance: "54.1%",
    companies: ["Goldman Sachs", "Visa"],
    status: "Unsolved",
    instructions: "Implement Insertion Sort to sort a sequence of n integers in-place.",
    codeTemplate: `function insertionSort(arr, n) {
  for(let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while(j >= 0 && arr[j] > key) {
      arr[j+1] = arr[j];
      j--;
    }
    arr[j+1] = key;
  }
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/insertion-sort/1"
  },
  {
    id: "sort-merge",
    title: "Merge Sort",
    difficulty: "Medium",
    category: "Sorting",
    acceptance: "45.7%",
    companies: ["Oracle", "Qualcomm"],
    status: "Unsolved",
    instructions: "Implement Merge Sort recursively to sort array elements in O(N log N) runtime.",
    codeTemplate: `function mergeSort(arr, l, r) {
  if (l >= r) return;
  let m = l + Math.floor((r - l) / 2);
  mergeSort(arr, l, m);
  mergeSort(arr, m + 1, r);
  // merge operation implementation
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/merge-sort/1"
  },
  {
    id: "sort-quick",
    title: "Quick Sort",
    difficulty: "Medium",
    category: "Sorting",
    acceptance: "41.6%",
    companies: ["Yahoo", "JPMorgan"],
    status: "Unsolved",
    instructions: "Perform quicksort algorithm using partition elements recursively.",
    codeTemplate: `function quickSort(arr, low, high) {
  if (low < high) {
    let pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/quick-sort/1"
  },
  {
    id: "sort-selection",
    title: "Selection Sort",
    difficulty: "Easy",
    category: "Sorting",
    acceptance: "63.9%",
    companies: ["Cognizant", "TCS"],
    status: "Unsolved",
    instructions: "Find minimum values in sub-ranges and swap them to sort the input array.",
    codeTemplate: `function selectionSort(arr, n) {
  for(let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for(let j = i + 1; j < n; j++) {
      if(arr[j] < arr[minIdx]) minIdx = j;
    }
    let temp = arr[minIdx];
    arr[minIdx] = arr[i];
    arr[i] = temp;
  }
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/selection-sort/1"
  },
  {
    id: "hash-map",
    title: "Design HashMap",
    difficulty: "Easy",
    category: "Hashing",
    acceptance: "65.1%",
    companies: ["Google", "Meta"],
    status: "Unsolved",
    instructions: "Design a basic Hash Map structure without using custom javascript objects.",
    codeTemplate: `class MyHashMap {
  constructor() {
    this.map = new Array(1000001).fill(-1);
  }
  put(key, value) {
    this.map[key] = value;
  }
  get(key) {
    return this.map[key];
  }
  remove(key) {
    this.map[key] = -1;
  }
}`,
    practiceLink: "https://leetcode.com/problems/design-hashmap/description/"
  },
  {
    id: "hash-set",
    title: "Design HashSet",
    difficulty: "Easy",
    category: "Hashing",
    acceptance: "67.2%",
    companies: ["Amazon", "Uber"],
    status: "Unsolved",
    instructions: "Design a boolean hash set containing add, contains, and remove helper methods.",
    codeTemplate: `class MyHashSet {
  constructor() {
    this.set = new Array(1000001).fill(false);
  }
  add(key) {
    this.set[key] = true;
  }
  remove(key) {
    this.set[key] = false;
  }
  contains(key) {
    return this.set[key];
  }
}`,
    practiceLink: "https://leetcode.com/problems/design-hashset/description/"
  },
  {
    id: "rec-factorial",
    title: "Factorial",
    difficulty: "Easy",
    category: "Recursion",
    acceptance: "69.1%",
    companies: ["Wipro", "L&T"],
    status: "Unsolved",
    instructions: "Return N factorial value using a simple recursive definition.",
    codeTemplate: `function factorial(N) {
  if(N <= 1) return 1;
  return N * factorial(N - 1);
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/factorial5739/1"
  },
  {
    id: "rec-power-three",
    title: "Power of Three",
    difficulty: "Easy",
    category: "Recursion",
    acceptance: "45.9%",
    companies: ["Microsoft", "Bloomberg"],
    status: "Unsolved",
    instructions: "Return true if the integer is a power of three using recursive evaluations.",
    codeTemplate: `function isPowerOfThree(n) {
  if(n <= 0) return false;
  if(n === 1) return true;
  return n % 3 === 0 && isPowerOfThree(n / 3);
}`,
    practiceLink: "https://leetcode.com/problems/power-of-three/description/"
  },
  {
    id: "rec-pow-x-n",
    title: "Pow(x, n)",
    difficulty: "Medium",
    category: "Recursion",
    acceptance: "34.1%",
    companies: ["Facebook", "LinkedIn"],
    status: "Unsolved",
    instructions: "Compute x raised to the power n using fast logarithmic recursive multiplications.",
    codeTemplate: `function myPow(x, n) {
  if(n === 0) return 1;
  if(n < 0) {
    x = 1/x;
    n = -n;
  }
  let half = myPow(x, Math.floor(n/2));
  if(n % 2 === 0) return half * half;
  return half * half * x;
}`,
    practiceLink: "https://leetcode.com/problems/powx-n/description/"
  },
  {
    id: "rec-fibonacci",
    title: "Fibonacci Number",
    difficulty: "Easy",
    category: "Recursion",
    acceptance: "70.2%",
    companies: ["Adobe", "Apple"],
    status: "Unsolved",
    instructions: "Return the Nth Fibonacci number where values sum from F(n-1) + F(n-2).",
    codeTemplate: `function fib(n) {
  if(n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    practiceLink: "https://leetcode.com/problems/fibonacci-number/description/"
  },
  {
    id: "rec-unique-digits",
    title: "Unique 3-Digit Even Number",
    difficulty: "Medium",
    category: "Recursion",
    acceptance: "52.8%",
    companies: ["Paypal", "Walmart"],
    status: "Unsolved",
    instructions: "Generate distinct 3-digit even integer values using elements in a given digit pool.",
    codeTemplate: `function findEvenNumbers(digits) {
  // Generate combinations recursively
  return [];
}`,
    practiceLink: "https://leetcode.com/problems/unique-3-digit-even-numbers/description/"
  },
  {
    id: "tree-inorder",
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    category: "Trees",
    acceptance: "74.8%",
    companies: ["Google", "Meta"],
    status: "Unsolved",
    instructions: "Traverse tree nodes recursively in LNR (Left-Node-Right) order.",
    codeTemplate: `function inorderTraversal(root) {
  let res = [];
  function traverse(node) {
    if(!node) return;
    traverse(node.left);
    res.push(node.val);
    traverse(node.right);
  }
  traverse(root);
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/binary-tree-inorder-traversal/description/"
  },
  {
    id: "tree-preorder",
    title: "Binary Tree Preorder Traversal",
    difficulty: "Easy",
    category: "Trees",
    acceptance: "69.1%",
    companies: ["Amazon", "Apple"],
    status: "Unsolved",
    instructions: "Traverse tree nodes recursively in NLR (Node-Left-Right) order.",
    codeTemplate: `function preorderTraversal(root) {
  let res = [];
  function traverse(node) {
    if(!node) return;
    res.push(node.val);
    traverse(node.left);
    traverse(node.right);
  }
  traverse(root);
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/binary-tree-preorder-traversal/description/"
  },
  {
    id: "tree-postorder",
    title: "Binary Tree Postorder Traversal",
    difficulty: "Easy",
    category: "Trees",
    acceptance: "70.5%",
    companies: ["Microsoft", "LinkedIn"],
    status: "Unsolved",
    instructions: "Traverse tree nodes recursively in LRN (Left-Right-Node) order.",
    codeTemplate: `function postorderTraversal(root) {
  let res = [];
  function traverse(node) {
    if(!node) return;
    traverse(node.left);
    traverse(node.right);
    res.push(node.val);
  }
  traverse(root);
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/binary-tree-postorder-traversal/description/"
  },
  {
    id: "tree-same",
    title: "Same Tree",
    difficulty: "Easy",
    category: "Trees",
    acceptance: "59.2%",
    companies: ["Bloomberg", "Netflix"],
    status: "Unsolved",
    instructions: "Compare structures and nodes of two trees p and q recursively to verify if they are identical.",
    codeTemplate: `function isSameTree(p, q) {
  if(!p && !q) return true;
  if(!p || !q) return false;
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
    practiceLink: "https://leetcode.com/problems/same-tree/description/"
  },
  {
    id: "tree-max-depth",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    category: "Trees",
    acceptance: "74.1%",
    companies: ["Google", "Uber"],
    status: "Unsolved",
    instructions: "Identify the number of nodes along the longest path down to a leaf node.",
    codeTemplate: `function maxDepth(root) {
  if(!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    practiceLink: "https://leetcode.com/problems/maximum-depth-of-binary-tree/description/"
  },
  {
    id: "tree-path-sum",
    title: "Path Sum",
    difficulty: "Easy",
    category: "Trees",
    acceptance: "49.6%",
    companies: ["Oracle", "eBay"],
    status: "Unsolved",
    instructions: "Evaluate if there is a root-to-leaf path sum that equals targetSum.",
    codeTemplate: `function hasPathSum(root, targetSum) {
  if(!root) return false;
  if(!root.left && !root.right) return root.val === targetSum;
  return hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val);
}`,
    practiceLink: "https://leetcode.com/problems/path-sum/description/"
  },
  {
    id: "heap-min-operations",
    title: "Operations on Binary Min Heap",
    difficulty: "Medium",
    category: "Heap",
    acceptance: "50.1%",
    companies: ["JPMorgan", "Morgan Stanley"],
    status: "Unsolved",
    instructions: "Implement fundamental heap operations including push, extractMin, and decreaseKey indices.",
    codeTemplate: `class MinHeap {
  constructor() {
    this.harr = [];
  }
  // Implement min heap operations here
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/operations-on-binary-min-heap/1"
  },
  {
    id: "heap-sort",
    title: "Heap Sort",
    difficulty: "Medium",
    category: "Heap",
    acceptance: "53.2%",
    companies: ["Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Implement Heap Sort to sort an array using min or max heap structures.",
    codeTemplate: `function heapSort(arr, n) {
  // Build heap and extract sorted elements
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/heap-sort/1"
  },
  {
    id: "heap-min-cost-ropes",
    title: "Minimum Cost of Ropes",
    difficulty: "Easy",
    category: "Heap",
    acceptance: "56.4%",
    companies: ["Goldman Sachs", "Oyo"],
    status: "Unsolved",
    instructions: "Connect ropes of varying lengths into a single rope with minimal total cost using a min-heap.",
    codeTemplate: `function minCost(arr, n) {
  // Implement min cost connection logic
  return 0;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1"
  },
  {
    id: "heap-kth-largest",
    title: "Kth Largest Element in a Stream",
    difficulty: "Easy",
    category: "Heap",
    acceptance: "56.8%",
    companies: ["Google", "Amazon"],
    status: "Unsolved",
    instructions: "Design a stream class to dynamically calculate the kth largest item from a continuous input flow.",
    codeTemplate: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = [];
  }
  add(val) {
    return 0;
  }
}`,
    practiceLink: "https://leetcode.com/problems/kth-largest-element-in-a-stream/description/"
  },
  {
    id: "heap-last-stone",
    title: "Last Stone Weight",
    difficulty: "Easy",
    category: "Heap",
    acceptance: "65.3%",
    companies: ["Adobe", "Salesforce"],
    status: "Unsolved",
    instructions: "Splat heavy stones together continuously until only one remains. Return the weight of the last stone.",
    codeTemplate: `function lastStoneWeight(stones) {
  // Use max heap simulation
  return 0;
}`,
    practiceLink: "https://leetcode.com/problems/last-stone-weight/description/"
  },
  {
    id: "greedy-longest-pal",
    title: "Longest Palindrome",
    difficulty: "Easy",
    category: "Greedy Algorithm",
    acceptance: "54.7%",
    companies: ["Amazon", "Apple"],
    status: "Unsolved",
    instructions: "Determine the maximum length of a palindrome that can be constructed using given characters.",
    codeTemplate: `function longestPalindrome(s) {
  let counts = {};
  for(let char of s) {
    counts[char] = (counts[char] || 0) + 1;
  }
  let length = 0, hasOdd = false;
  for(let c in counts) {
    if(counts[c] % 2 === 0) length += counts[c];
    else {
      length += counts[c] - 1;
      hasOdd = true;
    }
  }
  return hasOdd ? length + 1 : length;
}`,
    practiceLink: "https://leetcode.com/problems/longest-palindrome/description/"
  },
  {
    id: "greedy-assign-cookies",
    title: "Assign Cookies",
    difficulty: "Easy",
    category: "Greedy Algorithm",
    acceptance: "51.1%",
    companies: ["Uber", "Tencent"],
    status: "Unsolved",
    instructions: "Match cookie sizes and kid hunger thresholds greedily to maximize content children.",
    codeTemplate: `function findContentChildren(g, s) {
  g.sort((a,b)=>a-b);
  s.sort((a,b)=>a-b);
  let i = 0, j = 0;
  while(i < g.length && j < s.length) {
    if(s[j] >= g[i]) i++;
    j++;
  }
  return i;
}`,
    practiceLink: "https://leetcode.com/problems/assign-cookies/description/"
  },
  {
    id: "greedy-arr-partition",
    title: "Array Partition",
    difficulty: "Easy",
    category: "Greedy Algorithm",
    acceptance: "78.2%",
    companies: ["Adobe", "eBay"],
    status: "Unsolved",
    instructions: "Sort and pair array values such that the total sum of the minimums of each pair is maximized.",
    codeTemplate: `function arrayPairSum(nums) {
  nums.sort((a,b)=>a-b);
  let sum = 0;
  for(let i=0; i<nums.length; i+=2) {
    sum += nums[i];
  }
  return sum;
}`,
    practiceLink: "https://leetcode.com/problems/array-partition/description/"
  },
  {
    id: "greedy-can-place-flowers",
    title: "Can Place Flowers",
    difficulty: "Easy",
    category: "Greedy Algorithm",
    acceptance: "32.4%",
    companies: ["LinkedIn", "Apple"],
    status: "Unsolved",
    instructions: "Check if n flower plots can be placed in empty spaces without overlapping adjacent plants.",
    codeTemplate: `function canPlaceFlowers(flowerbed, n) {
  let count = 0;
  for(let i=0; i<flowerbed.length; i++) {
    if(flowerbed[i] === 0 && (i === 0 || flowerbed[i-1] === 0) && (i === flowerbed.length-1 || flowerbed[i+1] === 0)) {
      flowerbed[i] = 1;
      count++;
    }
  }
  return count >= n;
}`,
    practiceLink: "https://leetcode.com/problems/can-place-flowers/description/"
  },
  {
    id: "greedy-lemonade-change",
    title: "Lemonade Change",
    difficulty: "Easy",
    category: "Greedy Algorithm",
    acceptance: "53.1%",
    companies: ["Google", "Meta"],
    status: "Unsolved",
    instructions: "Given a sequence of bills $5, $10, and $20, check if you can always provide correct change to customers.",
    codeTemplate: `function lemonadeChange(bills) {
  let five = 0, ten = 0;
  for(let bill of bills) {
    if(bill === 5) five++;
    else if(bill === 10) {
      if(five === 0) return false;
      five--;
      ten++;
    } else {
      if(ten > 0 && five > 0) {
        ten--;
        five--;
      } else if(five >= 3) {
        five -= 3;
      } else {
        return false;
      }
    }
  }
  return true;
}`,
    practiceLink: "https://leetcode.com/problems/lemonade-change/description/"
  },
  {
    id: "dp-fibonacci",
    title: "Fibonacci Number (DP)",
    difficulty: "Easy",
    category: "Dynamic Programming",
    acceptance: "70.2%",
    companies: ["Microsoft", "Amazon"],
    status: "Unsolved",
    instructions: "Implement Fibonacci sequence calculation optimized with memoization or tabular methods.",
    codeTemplate: `function fib(n, memo = {}) {
  if(n <= 1) return n;
  if(memo[n]) return memo[n];
  memo[n] = fib(n-1, memo) + fib(n-2, memo);
  return memo[n];
}`,
    practiceLink: "https://leetcode.com/problems/fibonacci-number/description/"
  },
  {
    id: "dp-climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    acceptance: "52.3%",
    companies: ["Google", "Apple"],
    status: "Unsolved",
    instructions: "Find the count of distinct ways to climb a flight of n stairs using DP step sums.",
    codeTemplate: `function climbStairs(n) {
  if(n <= 2) return n;
  let first = 1, second = 2;
  for(let i=3; i<=n; i++) {
    let third = first + second;
    first = second;
    second = third;
  }
  return second;
}`,
    practiceLink: "https://leetcode.com/problems/climbing-stairs/description/"
  },
  {
    id: "dp-pascals-triangle",
    title: "Pascal's Triangle",
    difficulty: "Easy",
    category: "Dynamic Programming",
    acceptance: "72.4%",
    companies: ["Twitter", "Adobe"],
    status: "Unsolved",
    instructions: "Generate rows of Pascal\'s Triangle using previous row sum offsets.",
    codeTemplate: `function generate(numRows) {
  let res = [];
  for(let i=0; i<numRows; i++) {
    let row = new Array(i+1).fill(1);
    for(let j=1; j<i; j++) {
      row[j] = res[i-1][j-1] + res[i-1][j];
    }
    res.push(row);
  }
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/pascals-triangle/description/"
  },
  {
    id: "dp-best-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Dynamic Programming",
    acceptance: "54.2%",
    companies: ["Amazon", "Google"],
    status: "Unsolved",
    instructions: "Maximize stock trade profit by keeping track of minimum indices dynamically.",
    codeTemplate: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for(let price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  return maxProfit;
}`,
    practiceLink: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/description/"
  },
  {
    id: "dp-counting-bits",
    title: "Counting Bits",
    difficulty: "Easy",
    category: "Dynamic Programming",
    acceptance: "78.4%",
    companies: ["Qualcomm", "Nvidia"],
    status: "Unsolved",
    instructions: "Return bit counts for integers in range [0, n] using an O(N) DP relation.",
    codeTemplate: `function countBits(n) {
  let ans = new Array(n+1).fill(0);
  for(let i=1; i<=n; i++) {
    ans[i] = ans[i >> 1] + (i & 1);
  }
  return ans;
}`,
    practiceLink: "https://leetcode.com/problems/counting-bits/description/"
  },
  {
    id: "graph-adj-list",
    title: "Print Adjacency List",
    difficulty: "Easy",
    category: "Graph",
    acceptance: "75.3%",
    companies: ["Cisco", "HCL"],
    status: "Unsolved",
    instructions: "Represent and format a graph\'s connections using an adjacency list structure.",
    codeTemplate: `function printGraph(V, adj) {
  let list = [];
  for(let i=0; i<V; i++) {
    list.push(adj[i]);
  }
  return list;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1"
  },
  {
    id: "graph-rotting-oranges",
    title: "Rotting Oranges",
    difficulty: "Medium",
    category: "Graph",
    acceptance: "53.6%",
    companies: ["Amazon", "Google"],
    status: "Unsolved",
    instructions: "Determine the minimum minutes needed to infect all fresh grid oranges using a BFS queue.",
    codeTemplate: `function orangesRotting(grid) {
  // Write queue BFS solver
  return -1;
}`,
    practiceLink: "https://leetcode.com/problems/rotting-oranges/description/"
  },
  {
    id: "graph-path-exists",
    title: "Find if Path Exists in Graph",
    difficulty: "Easy",
    category: "Graph",
    acceptance: "53.4%",
    companies: ["Salesforce", "Visa"],
    status: "Unsolved",
    instructions: "Verify if there is a valid path from source to target nodes using standard BFS search routines.",
    codeTemplate: `function validPath(n, edges, source, destination) {
  // Write path checks using adj lists and BFS queue
  return false;
}`,
    practiceLink: "https://leetcode.com/problems/find-if-path-exists-in-graph/description/"
  },
  {
    id: "graph-directed-cycle",
    title: "Directed Graph Cycle Detection",
    difficulty: "Medium",
    category: "Graph",
    acceptance: "35.8%",
    companies: ["Samsung", "Oracle"],
    status: "Unsolved",
    instructions: "Detect cycles inside a directed graph structure recursively using DFS visit trackers.",
    codeTemplate: `function isCyclic(V, adj) {
  // Write recursive cycle search function
  return false;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1"
  },
  {
    id: "graph-num-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Graph",
    acceptance: "58.2%",
    companies: ["Google", "Meta", "Amazon"],
    status: "Unsolved",
    instructions: "Traverse grid lands and flood recursive DFS checks to find total island groupings.",
    codeTemplate: `function numIslands(grid) {
  // Write flood recursive island marker checks
  return 0;
}`,
    practiceLink: "https://leetcode.com/problems/number-of-islands/description/"
  },
  // --- ADDITIONAL TOP DSA PRACTICE PROBLEMS ---
  {
    id: "arr-kadanes-algo",
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: "Medium",
    category: "Array",
    acceptance: "50.4%",
    companies: ["Amazon", "Microsoft", "Google"],
    status: "Unsolved",
    instructions: "Find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    codeTemplate: `function maxSubArray(nums) {
  let maxSoFar = nums[0], maxEndingHere = nums[0];
  for (let i = 1; i < nums.length; i++) {
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}`,
    practiceLink: "https://leetcode.com/problems/maximum-subarray/description/"
  },
  {
    id: "arr-3sum",
    title: "3Sum",
    difficulty: "Medium",
    category: "Two Pointers",
    acceptance: "33.5%",
    companies: ["Meta", "Amazon", "Apple"],
    status: "Unsolved",
    instructions: "Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0.",
    codeTemplate: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}`,
    practiceLink: "https://leetcode.com/problems/3sum/description/"
  },
  {
    id: "arr-container-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    acceptance: "54.1%",
    companies: ["Google", "Amazon", "Adobe"],
    status: "Unsolved",
    instructions: "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    codeTemplate: `function maxArea(height) {
  let left = 0, right = height.length - 1, maxWater = 0;
  while (left < right) {
    const w = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, w * h);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}`,
    practiceLink: "https://leetcode.com/problems/container-with-most-water/description/"
  },
  {
    id: "arr-product-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    category: "Array",
    acceptance: "65.2%",
    companies: ["Amazon", "Apple", "Microsoft"],
    status: "Unsolved",
    instructions: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i] without using division.",
    codeTemplate: `function productExceptSelf(nums) {
  const n = nums.length;
  const res = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    res[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= suffix;
    suffix *= nums[i];
  }
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/product-of-array-except-self/description/"
  },
  {
    id: "arr-trapping-rainwater",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    category: "Two Pointers",
    acceptance: "60.3%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    codeTemplate: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
    practiceLink: "https://leetcode.com/problems/trapping-rain-water/description/"
  },
  {
    id: "arr-merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Array",
    acceptance: "46.8%",
    companies: ["Google", "Meta", "Uber"],
    status: "Unsolved",
    instructions: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
    codeTemplate: `function merge(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      res.push(intervals[i]);
    }
  }
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/merge-intervals/description/"
  },
  {
    id: "str-longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    acceptance: "34.2%",
    companies: ["Amazon", "Microsoft", "Meta"],
    status: "Unsolved",
    instructions: "Given a string s, find the length of the longest substring without repeating characters.",
    codeTemplate: `function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    practiceLink: "https://leetcode.com/problems/longest-substring-without-repeating-characters/description/"
  },
  {
    id: "str-valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    category: "Strings",
    acceptance: "63.5%",
    companies: ["Uber", "Google", "Amazon"],
    status: "Unsolved",
    instructions: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    codeTemplate: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (let c of s) count[c] = (count[c] || 0) + 1;
  for (let c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
    practiceLink: "https://leetcode.com/problems/valid-anagram/description/"
  },
  {
    id: "str-group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Strings",
    acceptance: "67.1%",
    companies: ["Amazon", "Meta", "Apple"],
    status: "Unsolved",
    instructions: "Given an array of strings strs, group the anagrams together in any order.",
    codeTemplate: `function groupAnagrams(strs) {
  const map = new Map();
  for (let s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return Array.from(map.values());
}`,
    practiceLink: "https://leetcode.com/problems/group-anagrams/description/"
  },
  {
    id: "str-min-window-substring",
    title: "Minimum Window Substring",
    difficulty: "Hard",
    category: "Sliding Window",
    acceptance: "41.8%",
    companies: ["Meta", "Amazon", "Google"],
    status: "Unsolved",
    instructions: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    codeTemplate: `function minWindow(s, t) {
  // Implement variable size sliding window
  return "";
}`,
    practiceLink: "https://leetcode.com/problems/minimum-window-substring/description/"
  },
  {
    id: "ll-cycle-ii",
    title: "Linked List Cycle II (Detect Loop Entry)",
    difficulty: "Medium",
    category: "Linked Lists",
    acceptance: "50.1%",
    companies: ["Amazon", "Microsoft", "Adobe"],
    status: "Unsolved",
    instructions: "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.",
    codeTemplate: `function detectCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let entry = head;
      while (entry !== slow) {
        entry = entry.next;
        slow = slow.next;
      }
      return entry;
    }
  }
  return null;
}`,
    practiceLink: "https://leetcode.com/problems/linked-list-cycle-ii/description/"
  },
  {
    id: "ll-add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "Medium",
    category: "Linked Lists",
    acceptance: "41.2%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "You are given two non-empty linked lists representing two non-negative integers stored in reverse order. Add the two numbers and return the sum as a linked list.",
    codeTemplate: `function addTwoNumbers(l1, l2) {
  let dummy = { val: 0, next: null };
  let curr = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    curr.next = { val: sum % 10, next: null };
    curr = curr.next;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return dummy.next;
}`,
    practiceLink: "https://leetcode.com/problems/add-two-numbers/description/"
  },
  {
    id: "ll-lru-cache",
    title: "LRU Cache (Design)",
    difficulty: "Medium",
    category: "Linked Lists",
    acceptance: "42.0%",
    companies: ["Google", "Amazon", "Apple"],
    status: "Unsolved",
    instructions: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.",
    codeTemplate: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
}`,
    practiceLink: "https://leetcode.com/problems/lru-cache/description/"
  },
  {
    id: "stack-valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack & Queue",
    acceptance: "40.5%",
    companies: ["Amazon", "Microsoft", "Meta"],
    status: "Unsolved",
    instructions: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    codeTemplate: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    practiceLink: "https://leetcode.com/problems/valid-parentheses/description/"
  },
  {
    id: "stack-min-stack",
    title: "Min Stack Design",
    difficulty: "Medium",
    category: "Stack & Queue",
    acceptance: "53.2%",
    companies: ["Google", "Bloomberg", "Amazon"],
    status: "Unsolved",
    instructions: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).",
    codeTemplate: `class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  push(val) {
    this.stack.push(val);
    if (!this.minStack.length || val <= this.getMin()) this.minStack.push(val);
  }
  pop() {
    const val = this.stack.pop();
    if (val === this.getMin()) this.minStack.pop();
  }
  top() { return this.stack[this.stack.length - 1]; }
  getMin() { return this.minStack[this.minStack.length - 1]; }
}`,
    practiceLink: "https://leetcode.com/problems/min-stack/description/"
  },
  {
    id: "stack-daily-temperatures",
    title: "Daily Temperatures (Monotonic Stack)",
    difficulty: "Medium",
    category: "Stack & Queue",
    acceptance: "66.0%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Given an array of temperatures, return an array answer such that answer[i] is the number of days you have to wait after the i-th day to get a warmer temperature.",
    codeTemplate: `function dailyTemperatures(temperatures) {
  const res = new Array(temperatures.length).fill(0);
  const stack = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      res[prevIdx] = i - prevIdx;
    }
    stack.push(i);
  }
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/daily-temperatures/description/"
  },
  {
    id: "tree-level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Trees",
    acceptance: "66.8%",
    companies: ["Amazon", "Microsoft", "Meta"],
    status: "Unsolved",
    instructions: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    codeTemplate: `function levelOrder(root) {
  if (!root) return [];
  const res = [], queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    const currentLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(currentLevel);
  }
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/binary-tree-level-order-traversal/description/"
  },
  {
    id: "tree-lca",
    title: "Lowest Common Ancestor of Binary Tree",
    difficulty: "Medium",
    category: "Trees",
    acceptance: "60.4%",
    companies: ["Meta", "Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes p and q.",
    codeTemplate: `function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}`,
    practiceLink: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/"
  },
  {
    id: "tree-validate-bst",
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    category: "Trees",
    acceptance: "32.4%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    codeTemplate: `function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
}`,
    practiceLink: "https://leetcode.com/problems/validate-binary-search-tree/description/"
  },
  {
    id: "graph-course-schedule",
    title: "Course Schedule (Topological Sort)",
    difficulty: "Medium",
    category: "Graph",
    acceptance: "47.2%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Determine if you can finish all prerequisite courses using Kahn's algorithm or DFS cycle detection.",
    codeTemplate: `function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (let [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i);
  let count = 0;
  while (queue.length) {
    const node = queue.shift();
    count++;
    for (let neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }
  return count === numCourses;
}`,
    practiceLink: "https://leetcode.com/problems/course-schedule/description/"
  },
  {
    id: "graph-dijkstra",
    title: "Dijkstra's Shortest Path Algorithm",
    difficulty: "Medium",
    category: "Graph",
    acceptance: "52.0%",
    companies: ["Google", "Uber", "Amazon"],
    status: "Unsolved",
    instructions: "Given a weighted graph and a starting vertex, find the shortest distances to all other vertices.",
    codeTemplate: `function dijkstra(V, adj, S) {
  const dist = new Array(V).fill(Infinity);
  dist[S] = 0;
  const pq = [[0, S]]; // [distance, node]
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (let [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist;
}`,
    practiceLink: "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1"
  },
  {
    id: "dp-coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "42.8%",
    companies: ["Amazon", "Google", "Microsoft"],
    status: "Unsolved",
    instructions: "Return the fewest number of coins needed to make up a given target amount.",
    codeTemplate: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (let coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    practiceLink: "https://leetcode.com/problems/coin-change/description/"
  },
  {
    id: "dp-lcs",
    title: "Longest Common Subsequence (LCS)",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "59.1%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Given two strings text1 and text2, return the length of their longest common subsequence.",
    codeTemplate: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
    practiceLink: "https://leetcode.com/problems/longest-common-subsequence/description/"
  },
  {
    id: "dp-lis",
    title: "Longest Increasing Subsequence (LIS)",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "54.0%",
    companies: ["Google", "Microsoft", "Amazon"],
    status: "Unsolved",
    instructions: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    codeTemplate: `function lengthOfLIS(nums) {
  if (!nums.length) return 0;
  const dp = new Array(nums.length).fill(1);
  let maxLIS = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLIS = Math.max(maxLIS, dp[i]);
  }
  return maxLIS;
}`,
    practiceLink: "https://leetcode.com/problems/longest-increasing-subsequence/description/"
  },
  {
    id: "dp-edit-distance",
    title: "Edit Distance (Levenshtein Distance)",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "55.8%",
    companies: ["Google", "Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Return the minimum number of operations (insert, delete, replace) required to convert word1 into word2.",
    codeTemplate: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}`,
    practiceLink: "https://leetcode.com/problems/edit-distance/description/"
  },
  {
    id: "backtrack-subsets",
    title: "Subsets (Power Set)",
    difficulty: "Medium",
    category: "Backtracking",
    acceptance: "76.2%",
    companies: ["Meta", "Amazon", "Google"],
    status: "Unsolved",
    instructions: "Given an integer array nums of unique elements, return all possible subsets (the power set).",
    codeTemplate: `function subsets(nums) {
  const res = [];
  function backtrack(start, current) {
    res.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/subsets/description/"
  },
  {
    id: "backtrack-permutations",
    title: "Permutations",
    difficulty: "Medium",
    category: "Backtracking",
    acceptance: "77.5%",
    companies: ["Google", "Amazon", "LinkedIn"],
    status: "Unsolved",
    instructions: "Given an array nums of distinct integers, return all possible permutations.",
    codeTemplate: `function permute(nums) {
  const res = [];
  function backtrack(current, used) {
    if (current.length === nums.length) {
      res.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      backtrack(current, used);
      current.pop();
      used[i] = false;
    }
  }
  backtrack([], []);
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/permutations/description/"
  },
  {
    id: "backtrack-n-queens",
    title: "N-Queens",
    difficulty: "Hard",
    category: "Backtracking",
    acceptance: "66.5%",
    companies: ["Google", "Meta", "Amazon"],
    status: "Unsolved",
    instructions: "Place N chess queens on an N×N chessboard such that no two queens attack each other.",
    codeTemplate: `function solveNQueens(n) {
  const res = [];
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  function backtrack(r, board) {
    if (r === n) {
      res.push(board.map(row => row.join('')));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag1.has(r - c) || diag2.has(r + c)) continue;
      cols.add(c); diag1.add(r - c); diag2.add(r + c);
      board[r][c] = 'Q';
      backtrack(r + 1, board);
      board[r][c] = '.';
      cols.delete(c); diag1.delete(r - c); diag2.delete(r + c);
    }
  }
  const emptyBoard = Array.from({ length: n }, () => new Array(n).fill('.'));
  backtrack(0, emptyBoard);
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/n-queens/description/"
  },
  {
    id: "heap-top-k-frequent",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    category: "Heap",
    acceptance: "62.8%",
    companies: ["Amazon", "Meta", "Google"],
    status: "Unsolved",
    instructions: "Given an integer array nums and an integer k, return the k most frequent elements.",
    codeTemplate: `function topKFrequent(nums, k) {
  const count = {};
  for (let n of nums) count[n] = (count[n] || 0) + 1;
  const bucket = Array.from({ length: nums.length + 1 }, () => []);
  for (let n in count) bucket[count[n]].push(Number(n));
  const res = [];
  for (let i = bucket.length - 1; i >= 0 && res.length < k; i--) {
    if (bucket[i].length) res.push(...bucket[i]);
  }
  return res.slice(0, k);
}`,
    practiceLink: "https://leetcode.com/problems/top-k-frequent-elements/description/"
  },
  {
    id: "bit-single-number",
    title: "Single Number (XOR Bit Trick)",
    difficulty: "Easy",
    category: "Bit Manipulation",
    acceptance: "71.9%",
    companies: ["Amazon", "Google", "Apple"],
    status: "Unsolved",
    instructions: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one in O(N) time and O(1) space.",
    codeTemplate: `function singleNumber(nums) {
  let result = 0;
  for (let n of nums) {
    result ^= n;
  }
  return result;
}`,
    practiceLink: "https://leetcode.com/problems/single-number/description/"
  },
  {
    id: "bit-number-of-1-bits",
    title: "Number of 1 Bits (Hamming Weight)",
    difficulty: "Easy",
    category: "Bit Manipulation",
    acceptance: "68.4%",
    companies: ["Microsoft", "Apple", "Google"],
    status: "Unsolved",
    instructions: "Write a function that takes the binary representation of a positive integer and returns the number of set bits (Brian Kernighan's Algorithm).",
    codeTemplate: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= (n - 1);
    count++;
  }
  return count;
}`,
    practiceLink: "https://leetcode.com/problems/number-of-1-bits/description/"
  },
  {
    id: "arr-search-rotated-sorted",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Array",
    acceptance: "39.8%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "Given a rotated sorted array nums and a target value, return its index in O(log N) runtime using binary search.",
    codeTemplate: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}`,
    practiceLink: "https://leetcode.com/problems/search-in-rotated-sorted-array/description/"
  },
  {
    id: "arr-find-min-rotated-sorted",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Array",
    acceptance: "49.5%",
    companies: ["Microsoft", "Amazon", "Apple"],
    status: "Unsolved",
    instructions: "Given a rotated sorted array of unique elements, return the minimum element in O(log N) time.",
    codeTemplate: `function findMin(nums) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    let mid = Math.floor((left + right) / 2);
    if (nums[mid] > nums[right]) left = mid + 1;
    else right = mid;
  }
  return nums[left];
}`,
    practiceLink: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/"
  },
  {
    id: "arr-subarray-sum-k",
    title: "Subarray Sum Equals K",
    difficulty: "Medium",
    category: "Array",
    acceptance: "43.6%",
    companies: ["Meta", "Google", "Amazon"],
    status: "Unsolved",
    instructions: "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.",
    codeTemplate: `function subarraySum(nums, k) {
  const map = new Map([[0, 1]]);
  let count = 0, sum = 0;
  for (let num of nums) {
    sum += num;
    if (map.has(sum - k)) count += map.get(sum - k);
    map.set(sum, (map.get(sum) || 0) + 1);
  }
  return count;
}`,
    practiceLink: "https://leetcode.com/problems/subarray-sum-equals-k/description/"
  },
  {
    id: "arr-rotate-image",
    title: "Rotate Image (90 Degrees Matrix Rotation)",
    difficulty: "Medium",
    category: "Array",
    acceptance: "72.1%",
    companies: ["Amazon", "Microsoft", "Apple"],
    status: "Unsolved",
    instructions: "Rotate an n x n 2D matrix representing an image by 90 degrees clockwise in-place.",
    codeTemplate: `function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
}`,
    practiceLink: "https://leetcode.com/problems/rotate-image/description/"
  },
  {
    id: "str-palindromic-substrings",
    title: "Palindromic Substrings",
    difficulty: "Medium",
    category: "Strings",
    acceptance: "67.4%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Given a string s, return the number of palindromic substrings in it by expanding around center points.",
    codeTemplate: `function countSubstrings(s) {
  let count = 0;
  function expand(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      count++; left--; right++;
    }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return count;
}`,
    practiceLink: "https://leetcode.com/problems/palindromic-substrings/description/"
  },
  {
    id: "dp-house-robber",
    title: "House Robber",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "50.2%",
    companies: ["Google", "Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Determine the maximum amount of money you can rob tonight without alerting the police by robbing adjacent houses.",
    codeTemplate: `function rob(nums) {
  if (!nums.length) return 0;
  let prev1 = 0, prev2 = 0;
  for (let num of nums) {
    let tmp = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = tmp;
  }
  return prev1;
}`,
    practiceLink: "https://leetcode.com/problems/house-robber/description/"
  },
  {
    id: "dp-word-break",
    title: "Word Break",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "46.1%",
    companies: ["Amazon", "Meta", "Google"],
    status: "Unsolved",
    instructions: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of dictionary words.",
    codeTemplate: `function wordBreak(s, wordDict) {
  const set = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && set.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}`,
    practiceLink: "https://leetcode.com/problems/word-break/description/"
  },
  {
    id: "dp-partition-subset-sum",
    title: "Partition Equal Subset Sum",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "46.9%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Given an array of integers nums, return true if you can partition the array into two subsets such that the sum of elements in both subsets is equal.",
    codeTemplate: `function canPartition(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2 !== 0) return false;
  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (let num of nums) {
    for (let j = target; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num];
    }
  }
  return dp[target];
}`,
    practiceLink: "https://leetcode.com/problems/partition-equal-subset-sum/description/"
  },
  {
    id: "tree-max-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    category: "Trees",
    acceptance: "39.5%",
    companies: ["Meta", "Google", "Amazon"],
    status: "Unsolved",
    instructions: "A path in a binary tree is a sequence of nodes. Return the maximum path sum of any non-empty path.",
    codeTemplate: `function maxPathSum(root) {
  let maxSum = -Infinity;
  function helper(node) {
    if (!node) return 0;
    const left = Math.max(0, helper(node.left));
    const right = Math.max(0, helper(node.right));
    maxSum = Math.max(maxSum, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  helper(root);
  return maxSum;
}`,
    practiceLink: "https://leetcode.com/problems/binary-tree-maximum-path-sum/description/"
  },
  {
    id: "str-permutation-in-string",
    title: "Permutation in String",
    difficulty: "Medium",
    category: "Sliding Window",
    acceptance: "44.3%",
    companies: ["Microsoft", "Amazon", "Apple"],
    status: "Unsolved",
    instructions: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.",
    codeTemplate: `function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const c1 = new Array(26).fill(0), c2 = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);
  for (let i = 0; i < s1.length; i++) {
    c1[s1.charCodeAt(i) - a]++;
    c2[s2.charCodeAt(i) - a]++;
  }
  let matches = 0;
  for (let i = 0; i < 26; i++) if (c1[i] === c2[i]) matches++;
  for (let i = 0; i < s2.length - s1.length; i++) {
    if (matches === 26) return true;
    const l = s2.charCodeAt(i) - a, r = s2.charCodeAt(i + s1.length) - a;
    c2[r]++;
    if (c1[r] === c2[r]) matches++;
    else if (c1[r] + 1 === c2[r]) matches--;
    c2[l]--;
    if (c1[l] === c2[l]) matches++;
    else if (c1[l] - 1 === c2[l]) matches--;
  }
  return matches === 26;
}`,
    practiceLink: "https://leetcode.com/problems/permutation-in-string/description/"
  },
  {
    id: "graph-clone-graph",
    title: "Clone Graph",
    difficulty: "Medium",
    category: "Graph",
    acceptance: "54.8%",
    companies: ["Meta", "Google", "Amazon"],
    status: "Unsolved",
    instructions: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
    codeTemplate: `function cloneGraph(node) {
  if (!node) return null;
  const visited = new Map();
  function dfs(curr) {
    if (visited.has(curr)) return visited.get(curr);
    const copy = { val: curr.val, neighbors: [] };
    visited.set(curr, copy);
    for (let neighbor of curr.neighbors) {
      copy.neighbors.push(dfs(neighbor));
    }
    return copy;
  }
  return dfs(node);
}`,
    practiceLink: "https://leetcode.com/problems/clone-graph/description/"
  },
  {
    id: "dp-unique-paths",
    title: "Unique Paths (Grid DP)",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "63.2%",
    companies: ["Amazon", "Google", "Microsoft"],
    status: "Unsolved",
    instructions: "A robot is located at top-left corner of an m x n grid. Return the number of possible unique paths to reach the bottom-right corner.",
    codeTemplate: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      row[j] += row[j - 1];
    }
  }
  return row[n - 1];
}`,
    practiceLink: "https://leetcode.com/problems/unique-paths/description/"
  },
  {
    id: "backtrack-word-search",
    title: "Word Search (Grid Backtracking)",
    difficulty: "Medium",
    category: "Backtracking",
    acceptance: "41.0%",
    companies: ["Amazon", "Microsoft", "Meta"],
    status: "Unsolved",
    instructions: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.",
    codeTemplate: `function exist(board, word) {
  const m = board.length, n = board[0].length;
  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== word[i]) return false;
    const tmp = board[r][c];
    board[r][c] = '#';
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = tmp;
    return found;
  }
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}`,
    practiceLink: "https://leetcode.com/problems/word-search/description/"
  },
  {
    id: "heap-median-data-stream",
    title: "Find Median from Data Stream",
    difficulty: "Hard",
    category: "Heap",
    acceptance: "51.7%",
    companies: ["Google", "Amazon", "Apple"],
    status: "Unsolved",
    instructions: "Design a data structure that supports adding numbers from a stream and finding the median in real-time using two heaps.",
    codeTemplate: `class MedianFinder {
  constructor() {
    this.small = []; // max heap
    this.large = []; // min heap
  }
  addNum(num) {
    // Two heap balancing logic
  }
  findMedian() {
    return 0.0;
  }
}`,
    practiceLink: "https://leetcode.com/problems/find-median-from-data-stream/description/"
  },
  // --- 20 HARD DSA PRACTICE PROBLEMS ---
  {
    id: "hard-sliding-window-max",
    title: "Sliding Window Maximum (Monotonic Deque)",
    difficulty: "Hard",
    category: "Sliding Window",
    acceptance: "46.5%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "You are given an array of integers nums and a sliding window of size k. Return the max sliding window values using a monotonic queue in O(N) time.",
    codeTemplate: `function maxSlidingWindow(nums, k) {
  const deque = []; // store indices
  const res = [];
  for (let i = 0; i < nums.length; i++) {
    if (deque.length && deque[0] < i - k + 1) deque.shift();
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) res.push(nums[deque[0]]);
  }
  return res;
}`,
    practiceLink: "https://leetcode.com/problems/sliding-window-maximum/description/"
  },
  {
    id: "hard-merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    category: "Linked Lists",
    acceptance: "51.2%",
    companies: ["Meta", "Amazon", "Google"],
    status: "Unsolved",
    instructions: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
    codeTemplate: `function mergeKLists(lists) {
  if (!lists.length) return null;
  while (lists.length > 1) {
    const merged = [];
    for (let i = 0; i < lists.length; i += 2) {
      const l1 = lists[i];
      const l2 = i + 1 < lists.length ? lists[i + 1] : null;
      merged.push(mergeTwoLists(l1, l2));
    }
    lists = merged;
  }
  return lists[0];
}
function mergeTwoLists(l1, l2) {
  let dummy = { val: 0, next: null }, curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }
  curr.next = l1 || l2;
  return dummy.next;
}`,
    practiceLink: "https://leetcode.com/problems/merge-k-sorted-lists/description/"
  },
  {
    id: "hard-serialize-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "Hard",
    category: "Trees",
    acceptance: "56.4%",
    companies: ["Google", "Meta", "Microsoft"],
    status: "Unsolved",
    instructions: "Design an algorithm to serialize a binary tree to a string and deserialize the string back to the original tree structure.",
    codeTemplate: `function serialize(root) {
  const res = [];
  function buildString(node) {
    if (!node) { res.push('N'); return; }
    res.push(node.val);
    buildString(node.left);
    buildString(node.right);
  }
  buildString(root);
  return res.join(',');
}
function deserialize(data) {
  const vals = data.split(',');
  let i = 0;
  function buildTree() {
    if (vals[i] === 'N') { i++; return null; }
    const node = { val: Number(vals[i++]), left: null, right: null };
    node.left = buildTree();
    node.right = buildTree();
    return node;
  }
  return buildTree();
}`,
    practiceLink: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/description/"
  },
  {
    id: "hard-regular-expression-matching",
    title: "Regular Expression Matching ('.' and '*')",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "28.5%",
    companies: ["Google", "Meta", "Amazon"],
    status: "Unsolved",
    instructions: "Given an input string s and a pattern p, implement regular expression matching with support for '.' (any single char) and '*' (zero or more of preceding char).",
    codeTemplate: `function isMatch(s, p) {
  const m = s.length, n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j <= n; j++) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === s[i - 1] || p[j - 1] === '.') {
        dp[i][j] = dp[i - 1][j - 1];
      } else if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 2] || ((p[j - 2] === s[i - 1] || p[j - 2] === '.') && dp[i - 1][j]);
      }
    }
  }
  return dp[m][n];
}`,
    practiceLink: "https://leetcode.com/problems/regular-expression-matching/description/"
  },
  {
    id: "hard-wildcard-matching",
    title: "Wildcard Matching ('?' and '*')",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "27.8%",
    companies: ["Microsoft", "Amazon", "Google"],
    status: "Unsolved",
    instructions: "Given an input string s and a pattern p, implement wildcard pattern matching with support for '?' (matches any single char) and '*' (matches any sequence of chars).",
    codeTemplate: `function isMatchWildcard(s, p) {
  let i = 0, j = 0, match = 0, starIdx = -1;
  while (i < s.length) {
    if (j < p.length && (p[j] === '?' || p[j] === s[i])) {
      i++; j++;
    } else if (j < p.length && p[j] === '*') {
      starIdx = j;
      match = i;
      j++;
    } else if (starIdx !== -1) {
      j = starIdx + 1;
      match++;
      i = match;
    } else {
      return false;
    }
  }
  while (j < p.length && p[j] === '*') j++;
  return j === p.length;
}`,
    practiceLink: "https://leetcode.com/problems/wildcard-matching/description/"
  },
  {
    id: "hard-alien-dictionary",
    title: "Alien Dictionary (Topological Sort)",
    difficulty: "Hard",
    category: "Graph",
    acceptance: "35.6%",
    companies: ["Meta", "Google", "Amazon"],
    status: "Unsolved",
    instructions: "Given a sorted dictionary of alien words, derive the order of letters in the alien alphabet using topological sorting.",
    codeTemplate: `function alienOrder(words) {
  const adj = new Map();
  const inDegree = new Map();
  for (let w of words) for (let c of w) { adj.set(c, new Set()); inDegree.set(c, 0); }
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    if (w1.length > w2.length && w1.startsWith(w2)) return "";
    for (let j = 0; j < Math.min(w1.length, w2.length); j++) {
      if (w1[j] !== w2[j]) {
        if (!adj.get(w1[j]).has(w2[j])) {
          adj.get(w1[j]).add(w2[j]);
          inDegree.set(w2[j], inDegree.get(w2[j]) + 1);
        }
        break;
      }
    }
  }
  const queue = [];
  for (let [c, deg] of inDegree) if (deg === 0) queue.push(c);
  let res = "";
  while (queue.length) {
    const c = queue.shift();
    res += c;
    for (let neighbor of adj.get(c)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }
  return res.length === inDegree.size ? res : "";
}`,
    practiceLink: "https://leetcode.com/problems/alien-dictionary/description/"
  },
  {
    id: "hard-word-ladder-ii",
    title: "Word Ladder II (Shortest Transformation Paths)",
    difficulty: "Hard",
    category: "Graph",
    acceptance: "27.5%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Given beginWord, endWord and wordList, return all shortest transformation sequences from beginWord to endWord using BFS + DFS backtracking.",
    codeTemplate: `function findLadders(beginWord, endWord, wordList) {
  // Return all shortest word transformation sequences
  return [];
}`,
    practiceLink: "https://leetcode.com/problems/word-ladder-ii/description/"
  },
  {
    id: "hard-word-search-ii",
    title: "Word Search II (Trie + Grid Backtracking)",
    difficulty: "Hard",
    category: "Backtracking",
    acceptance: "36.2%",
    companies: ["Amazon", "Microsoft", "Meta"],
    status: "Unsolved",
    instructions: "Given an m x n board of characters and a list of strings words, return all words present in the grid using Trie node traversal.",
    codeTemplate: `function findWords(board, words) {
  const trie = {};
  for (let w of words) {
    let curr = trie;
    for (let c of w) {
      if (!curr[c]) curr[c] = {};
      curr = curr[c];
    }
    curr.word = w;
  }
  const res = new Set();
  const m = board.length, n = board[0].length;
  function dfs(r, c, node) {
    if (node.word) res.add(node.word);
    if (r < 0 || r >= m || c < 0 || c >= n || !node[board[r][c]]) return;
    const char = board[r][c];
    board[r][c] = '#';
    for (let [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      dfs(r + dr, c + dc, node[char]);
    }
    board[r][c] = char;
  }
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) dfs(r, c, trie);
  return Array.from(res);
}`,
    practiceLink: "https://leetcode.com/problems/word-search-ii/description/"
  },
  {
    id: "hard-reverse-nodes-in-k-group",
    title: "Reverse Nodes in k-Group",
    difficulty: "Hard",
    category: "Linked Lists",
    acceptance: "57.8%",
    companies: ["Google", "Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.",
    codeTemplate: `function reverseKGroup(head, k) {
  let count = 0, curr = head;
  while (curr && count < k) { curr = curr.next; count++; }
  if (count === k) {
    let reversedHead = reverseKGroup(curr, k);
    while (count > 0) {
      let nxt = head.next;
      head.next = reversedHead;
      reversedHead = head;
      head = nxt;
      count--;
    }
    head = reversedHead;
  }
  return head;
}`,
    practiceLink: "https://leetcode.com/problems/reverse-nodes-in-k-group/description/"
  },
  {
    id: "hard-first-missing-positive",
    title: "First Missing Positive (In-Place O(N))",
    difficulty: "Hard",
    category: "Array",
    acceptance: "37.5%",
    companies: ["Amazon", "Meta", "Microsoft"],
    status: "Unsolved",
    instructions: "Given an unsorted integer array nums, return the smallest missing positive integer in O(N) time and O(1) auxiliary space.",
    codeTemplate: `function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const targetIdx = nums[i] - 1;
      [nums[i], nums[targetIdx]] = [nums[targetIdx], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }
  return n + 1;
}`,
    practiceLink: "https://leetcode.com/problems/first-missing-positive/description/"
  },
  {
    id: "hard-longest-valid-parentheses",
    title: "Longest Valid Parentheses",
    difficulty: "Hard",
    category: "Stack & Queue",
    acceptance: "33.2%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "Given a string containing just '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    codeTemplate: `function longestValidParentheses(s) {
  const stack = [-1];
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (!stack.length) {
        stack.push(i);
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }
  return maxLen;
}`,
    practiceLink: "https://leetcode.com/problems/longest-valid-parentheses/description/"
  },
  {
    id: "hard-largest-rectangle-histogram",
    title: "Largest Rectangle in Histogram",
    difficulty: "Hard",
    category: "Stack & Queue",
    acceptance: "43.5%",
    companies: ["Amazon", "Google", "Microsoft"],
    status: "Unsolved",
    instructions: "Given an array of integers heights representing the histogram's bar height where width is 1, find the area of the largest rectangle in the histogram.",
    codeTemplate: `function largestRectangleArea(heights) {
  const stack = [];
  let maxArea = 0;
  heights.push(0);
  for (let i = 0; i < heights.length; i++) {
    while (stack.length && heights[i] < heights[stack[stack.length - 1]]) {
      const h = heights[stack.pop()];
      const w = stack.length ? i - stack[stack.length - 1] - 1 : i;
      maxArea = Math.max(maxArea, h * w);
    }
    stack.push(i);
  }
  return maxArea;
}`,
    practiceLink: "https://leetcode.com/problems/largest-rectangle-in-histogram/description/"
  },
  {
    id: "hard-maximal-rectangle",
    title: "Maximal Rectangle in 2D Binary Grid",
    difficulty: "Hard",
    category: "Stack & Queue",
    acceptance: "45.8%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "Given a rows x cols binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area.",
    codeTemplate: `function maximalRectangle(matrix) {
  if (!matrix.length) return 0;
  const cols = matrix[0].length;
  const heights = new Array(cols).fill(0);
  let maxArea = 0;
  for (let row of matrix) {
    for (let j = 0; j < cols; j++) {
      heights[j] = row[j] === '1' ? heights[j] + 1 : 0;
    }
    maxArea = Math.max(maxArea, largestRectangleArea(heights));
  }
  return maxArea;
}`,
    practiceLink: "https://leetcode.com/problems/maximal-rectangle/description/"
  },
  {
    id: "hard-trapping-rain-water-ii",
    title: "Trapping Rain Water II (3D Priority Queue)",
    difficulty: "Hard",
    category: "Heap",
    acceptance: "48.2%",
    companies: ["Google", "Amazon", "Uber"],
    status: "Unsolved",
    instructions: "Given an m x n integer matrix heightMap representing 3D elevations, return the volume of water it can trap after raining using a min-heap priority queue.",
    codeTemplate: `function trapRainWater(heightMap) {
  // Implement 3D priority queue boundary traversal
  return 0;
}`,
    practiceLink: "https://leetcode.com/problems/trapping-rain-water-ii/description/"
  },
  {
    id: "hard-burst-balloons",
    title: "Burst Balloons (Interval DP)",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "58.1%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "Given n balloons with values, burst them to maximize coin collected nums[left] * nums[i] * nums[right] using interval DP.",
    codeTemplate: `function maxCoins(nums) {
  const val = [1, ...nums, 1];
  const n = val.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++) {
    for (let left = 0; left < n - len; left++) {
      const right = left + len;
      for (let i = left + 1; i < right; i++) {
        dp[left][right] = Math.max(dp[left][right], val[left] * val[i] * val[right] + dp[left][i] + dp[i][right]);
      }
    }
  }
  return dp[0][n - 1];
}`,
    practiceLink: "https://leetcode.com/problems/burst-balloons/description/"
  },
  {
    id: "hard-n-queens-ii",
    title: "N-Queens II (Total Distinct Solutions)",
    difficulty: "Hard",
    category: "Backtracking",
    acceptance: "72.4%",
    companies: ["Amazon", "Google", "Microsoft"],
    status: "Unsolved",
    instructions: "Return the total number of distinct solutions to the n-queens puzzle.",
    codeTemplate: `function totalNQueens(n) {
  let count = 0;
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  function backtrack(r) {
    if (r === n) { count++; return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag1.has(r - c) || diag2.has(r + c)) continue;
      cols.add(c); diag1.add(r - c); diag2.add(r + c);
      backtrack(r + 1);
      cols.delete(c); diag1.delete(r - c); diag2.delete(r + c);
    }
  }
  backtrack(0);
  return count;
}`,
    practiceLink: "https://leetcode.com/problems/n-queens-ii/description/"
  },
  {
    id: "hard-sudoku-solver",
    title: "Sudoku Solver",
    difficulty: "Hard",
    category: "Backtracking",
    acceptance: "60.2%",
    companies: ["Google", "Amazon", "Microsoft"],
    status: "Unsolved",
    instructions: "Write a program to solve a Sudoku puzzle by filling the empty cells ('.') using recursive backtracking.",
    codeTemplate: `function solveSudoku(board) {
  function isValid(r, c, char) {
    for (let i = 0; i < 9; i++) {
      if (board[r][i] === char || board[i][c] === char) return false;
      const subR = 3 * Math.floor(r / 3) + Math.floor(i / 3);
      const subC = 3 * Math.floor(c / 3) + i % 3;
      if (board[subR][subC] === char) return false;
    }
    return true;
  }
  function solve() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === '.') {
          for (let ch = 1; ch <= 9; ch++) {
            const char = String(ch);
            if (isValid(r, c, char)) {
              board[r][c] = char;
              if (solve()) return true;
              board[r][c] = '.';
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  solve();
}`,
    practiceLink: "https://leetcode.com/problems/sudoku-solver/description/"
  },
  {
    id: "hard-palindrome-partitioning-ii",
    title: "Palindrome Partitioning II (Min Cuts)",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "33.8%",
    companies: ["Amazon", "Google", "Meta"],
    status: "Unsolved",
    instructions: "Given a string s, partition s such that every substring of the partition is a palindrome. Return the minimum cuts needed.",
    codeTemplate: `function minCut(s) {
  const n = s.length;
  const dp = new Array(n).fill(0);
  const isPal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = 0; i < n; i++) {
    let minCuts = i;
    for (let j = 0; j <= i; j++) {
      if (s[j] === s[i] && (i - j <= 2 || isPal[j + 1][i - 1])) {
        isPal[j][i] = true;
        minCuts = j === 0 ? 0 : Math.min(minCuts, dp[j - 1] + 1);
      }
    }
    dp[i] = minCuts;
  }
  return dp[n - 1];
}`,
    practiceLink: "https://leetcode.com/problems/palindrome-partitioning-ii/description/"
  },
  {
    id: "hard-frog-jump",
    title: "Frog Jump (DP on Stone Positions)",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "45.2%",
    companies: ["Google", "Amazon", "Meta"],
    status: "Unsolved",
    instructions: "A frog is crossing a river with stones. If the last jump was k units, the next jump must be k-1, k, or k+1. Determine if the frog can reach the last stone.",
    codeTemplate: `function canCross(stones) {
  const dp = new Map();
  for (let stone of stones) dp.set(stone, new Set());
  dp.get(0).add(0);
  for (let i = 0; i < stones.length; i++) {
    const stone = stones[i];
    for (let k of dp.get(stone)) {
      for (let step of [k - 1, k, k + 1]) {
        if (step > 0 && dp.has(stone + step)) {
          dp.get(stone + step).add(step);
        }
      }
    }
  }
  return dp.get(stones[stones.length - 1]).size > 0;
}`,
    practiceLink: "https://leetcode.com/problems/frog-jump/description/"
  },
  {
    id: "hard-reconstruct-itinerary",
    title: "Reconstruct Itinerary (Eulerian Path)",
    difficulty: "Hard",
    category: "Graph",
    acceptance: "42.5%",
    companies: ["Google", "Amazon", "Uber"],
    status: "Unsolved",
    instructions: "Given a list of airline tickets represented by pairs of departure and arrival airports, reconstruct the itinerary in order starting from 'JFK' using Hierholzer's algorithm.",
    codeTemplate: `function findItinerary(tickets) {
  const adj = new Map();
  tickets.sort((a, b) => a[1].localeCompare(b[1]));
  for (let [src, dst] of tickets) {
    if (!adj.has(src)) adj.set(src, []);
    adj.get(src).push(dst);
  }
  const route = [];
  function dfs(airport) {
    const dests = adj.get(airport);
    while (dests && dests.length > 0) {
      dfs(dests.shift());
    }
    route.unshift(airport);
  }
  dfs("JFK");
  return route;
}`,
    practiceLink: "https://leetcode.com/problems/reconstruct-itinerary/description/"
  }
];

const STORAGE_KEY = "my_actual_solved_problem_ids_v1";

const CodingProblems = ({ selectedCategory, onSelectCategory, selectedCompany, onSelectCompany, onSelectProblem }) => {
  const { requireAuth } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(10);
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      // Clear legacy test data keys to ensure fresh user state
      localStorage.removeItem("user_solved_problem_ids");
      localStorage.removeItem("coding_problems_solved");

      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Auto-expand to show all questions when any filter (e.g. Easy, Medium, Hard, Solved, Search) is selected
  React.useEffect(() => {
    if (difficultyFilter !== "All" || statusFilter !== "All" || searchTerm.trim() !== "" || selectedCategory || selectedCompany) {
      setVisibleCount(1000);
    } else {
      setVisibleCount(10);
    }
  }, [searchTerm, difficultyFilter, statusFilter, selectedCategory, selectedCompany]);

  // Handle Solve button click: mark solved, open official practice link automatically, and load workspace
  const handleSolveClick = (problem) => {
    requireAuth(() => {
      // 1. Mark problem as solved in state & localStorage
      setSolvedIds((prev) => {
        const next = new Set(prev);
        next.add(problem.id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      // 2. Automatically open the official practice link in a new tab if present
      if (problem.practiceLink) {
        window.open(problem.practiceLink, "_blank", "noopener,noreferrer");
      }

      // 3. Load problem into code sandbox workspace
      onSelectProblem({ ...problem, status: "Solved" });

      // 4. Smooth scroll to AI Coding Assistant workspace below
      const workspaceEl = document.getElementById("ai-coding-assistant") || document.querySelector(".ai-assistant-section");
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: "smooth" });
      }
    }, "/coding-practice");
  };

  // Filtering Logic
  const filteredProblems = PROBLEMS.filter((problem) => {
    const isSolved = solvedIds.has(problem.id);
    const currentStatus = isSolved ? "Solved" : "Unsolved";

    // 1. Search filter
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category filter (from external categories grid)
    const matchesCategory = !selectedCategory || problem.category === selectedCategory;

    // 3. Company filter (from external companies pills)
    const matchesCompany = !selectedCompany || problem.companies.includes(selectedCompany);

    // 4. Difficulty dropdown filter (case-insensitive)
    const matchesDifficulty = difficultyFilter === "All" || problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    // 5. Status dropdown filter (case-insensitive)
    const matchesStatus = statusFilter === "All" || currentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesCompany && matchesDifficulty && matchesStatus;
  });

  // Display only up to visibleCount (first 10, then +10 on Learn More)
  const displayedProblems = filteredProblems.slice(0, visibleCount);

  return (
    <section className="coding-problems-section" id="coding-problems-list">
      <div className="coding-problems-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">💻 Code Sandbox Directory</span>
          <h2>Practice Problems</h2>
          <p>Search, filter, and choose a challenge. Click "Solve" to load the boilerplate template into the workspace below.</p>
        </div>

        {/* Filters Panel */}
        <div className="problems-filter-panel card">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search problem title..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="dropdowns-wrap">
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCategory || selectedCompany) && (
          <div className="active-filter-chips">
            {selectedCategory && (
              <span className="filter-chip">
                Category: <strong>{selectedCategory}</strong>
                <button onClick={() => onSelectCategory(null)}>×</button>
              </span>
            )}
            {selectedCompany && (
              <span className="filter-chip">
                Company: <strong>{selectedCompany}</strong>
                <button onClick={() => onSelectCompany(null)}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Problems Table */}
        <div className="table-responsive card">
          <table className="problems-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Acceptance</th>
                <th>Ask Target</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedProblems.length > 0 ? (
                displayedProblems.map((problem) => {
                  const isSolved = solvedIds.has(problem.id);
                  return (
                    <tr key={problem.id}>
                      <td>
                        <span className={`status-badge ${isSolved ? "solved" : "unsolved"}`}>
                          {isSolved ? "✓ Solved" : "○ Unsolved"}
                        </span>
                      </td>
                      <td className="problem-title-cell">
                        <strong>{problem.title}</strong>
                      </td>
                      <td>
                        <span className="category-cell-tag">{problem.category}</span>
                      </td>
                      <td>
                        <span className={`diff-chip ${problem.difficulty.toLowerCase()}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>{problem.acceptance}</td>
                      <td>
                        <div className="company-logos-row">
                          {problem.companies.map((comp) => (
                            <span key={comp} className={`mini-company-tag ${comp.toLowerCase()}`}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button 
                          className={`problem-solve-cta ${isSolved ? "solved-cta-btn" : ""}`}
                          onClick={() => handleSolveClick(problem)}
                        >
                          {isSolved ? "✓ Solved" : "Solve"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-results-cell">
                    <p>🔍 No practice problems match your search criteria. Try removing some filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Learn More / Next 10 Questions Pagination Button */}
        {filteredProblems.length > 10 && (
          <div className="load-more-questions-wrap" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "24px" }}>
            {visibleCount < filteredProblems.length ? (
              <button
                className="load-more-questions-btn"
                onClick={() => setVisibleCount((prev) => prev + 10)}
                style={{
                  padding: "12px 28px",
                  borderRadius: "14px",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(168, 85, 247, 0.25) 100%)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 6px 20px rgba(124, 58, 237, 0.2)",
                  transition: "all 0.25s ease"
                }}
              >
                <span>Learn More</span>
              </button>
            ) : (
              <button
                className="show-less-questions-btn"
                onClick={() => setVisibleCount(10)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#cbd5e1",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.25s ease"
                }}
              >
                Show Less ↑
              </button>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default CodingProblems;
export { PROBLEMS };
