import React, { useState } from "react";
import "./CodingProblems.css";

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
  }
];

const CodingProblems = ({ selectedCategory, onSelectCategory, selectedCompany, onSelectCompany, onSelectProblem }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filtering Logic
  const filteredProblems = PROBLEMS.filter((problem) => {
    // 1. Search filter
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category filter (from external categories grid)
    const matchesCategory = !selectedCategory || problem.category === selectedCategory;

    // 3. Company filter (from external companies pills)
    const matchesCompany = !selectedCompany || problem.companies.includes(selectedCompany);

    // 4. Difficulty dropdown filter
    const matchesDifficulty = difficultyFilter === "All" || problem.difficulty === difficultyFilter;

    // 5. Status dropdown filter
    const matchesStatus = statusFilter === "All" || problem.status === statusFilter;

    return matchesSearch && matchesCategory && matchesCompany && matchesDifficulty && matchesStatus;
  });

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
              <option value="In Progress">In Progress</option>
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
                <th>Official Practice</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <tr key={problem.id}>
                    <td>
                      <span className={`status-badge ${problem.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {problem.status === "Solved" ? "✓ Solved" : problem.status === "In Progress" ? "⚡ In Progress" : "○ Unsolved"}
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
                      {problem.practiceLink ? (
                        <a 
                          href={problem.practiceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="official-link-btn"
                        >
                          {problem.practiceLink.includes("leetcode.com") ? "LeetCode 🔗" : problem.practiceLink.includes("geeksforgeeks.org") ? "GeeksforGeeks 🔗" : "Practice 🔗"}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button 
                        className="problem-solve-cta"
                        onClick={() => onSelectProblem(problem)}
                      >
                        Solve ⚙️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-results-cell">
                    <p>🔍 No practice problems match your search criteria. Try removing some filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
};

export default CodingProblems;
export { PROBLEMS };
