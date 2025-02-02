#include<bits/stdc++.h>
using namespace std;

#define ll long long int
#define vi vector<int>
#define vll vector<long long int>
#define INF INT_MAX
#define MOD 1000000007
#define pii pair<int,int>
#define endl '\n'
#define pb push_back
#define all(x) x.begin(),x.end()
#define clr(x) memset(x,0,sizeof(x))
#define sortUni(v) sort(all(v)), v.erase(unique(all(v)), v.end())
#define fast_io ios::sync_with_stdio(0); cin.tie(0); cout.tie(0)
#define test int t;cin>>t;while(t--)
#define f0(i,n) for(int i = 0; i < n; i++)
#define take(a,n) vi a(n); f0(i,n) cin >> a[i];
#define give(a,n) f0(i,n){cout << a[i] << ' ';}cout << endl;

const string ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 

unordered_set<string> loadDictionary(const string &filename) {
    unordered_set<string> wordSet;
    ifstream file(filename);
    string word;
    while (file >> word) {
        transform(word.begin(), word.end(), word.begin(), ::toupper); // Ensure uppercase
        if (word.size() == 5) {
            wordSet.insert(word);
        }
    }
    return wordSet;
}

void backtrack(int idx,string &s,unordered_map<char,int>&fixedPlace,unordered_set<char>&isPresentSomewhere,unordered_set<char>&isNotPresentSomewhere,const unordered_set<string> &validWords){
    if(idx==5){
        for(char c:isPresentSomewhere){
            if(s.find(c) == string::npos) return;
        }
        if (validWords.find(s) != validWords.end()) { 
            cout << s << endl;
        }
        return;
    }

    if(s[idx] != 'X'){
        backtrack(idx+1,s,fixedPlace,isPresentSomewhere,isNotPresentSomewhere,validWords);
        return;
    }

    for (char c : ALPHABET) {
        if(isNotPresentSomewhere.find(c) == isNotPresentSomewhere.end()){
            s[idx] = c;
            backtrack(idx+1,s,fixedPlace,isPresentSomewhere,isNotPresentSomewhere,validWords);
            s[idx] = 'X';
        }
    }
}

void solve()
{
    unordered_set<string> validWords = loadDictionary("wordList.txt"); // Load dictionary from file
    string s = "XXXXX";
    unordered_map<char,int>fixed_place{
        
    };
    unordered_set<char>isPresentSomewhere{'H','I','K'};
    unordered_set<char>isNotPresentSomewhere{};
    for (auto &[ch, pos] : fixed_place) {
        s[pos] = ch;
    }
    backtrack(0,s,fixed_place,isPresentSomewhere,isNotPresentSomewhere,validWords);
}

int32_t main()
{
    #ifndef ONLINE_JUDGE
        freopen("in.txt","r",stdin);
        freopen("out.txt","w",stdout);
    #endif
    fast_io;
    solve();
    return 0;
}

