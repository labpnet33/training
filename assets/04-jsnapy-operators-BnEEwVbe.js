var e={id:`jsnapy-operators`,h:{en:`The operator toolbox: say what healthy means`,hi:`Operator toolbox: batao healthy ka matlab kya hai`},body:{en:`
<p>A test file is a list of sentences about the network: "every neighbour is Full", "the priority is between 1 and 255", "the list of peers has not shrunk". The words that make those sentences are JSNAPy's <b>operators</b>. Knowing the full set is what lets you write a check that really tests the thing you care about, instead of one that merely looks busy.</p>

<h3>The operators in four groups</h3>
<table class="cmp"><tr><th>Group</th><th>Operators</th><th>Reads as</th></tr>
<tr><td>Compare one value</td><td><code>is-equal</code>, <code>not-equal</code>, <code>is-gt</code>, <code>is-lt</code>, <code>in-range</code>, <code>not-range</code>, <code>contains</code>, <code>not-contains</code>, <code>is-in</code>, <code>not-in</code></td><td>The field is (not) equal, greater, in a range, inside a list</td></tr>
<tr><td>Presence</td><td><code>exists</code>, <code>not-exists</code></td><td>The field is (not) there at all</td></tr>
<tr><td>Look across nodes</td><td><code>all-same</code></td><td>Every node has the same value</td></tr>
<tr><td>Look across snapshots</td><td><code>no-diff</code>, <code>delta</code>, <code>list-not-less</code>, <code>list-not-more</code></td><td>Unchanged, changed by less than X, no entry lost, no entry gained</td></tr></table>
<p>The first three groups judge one snapshot. The last group compares <b>pre with post</b>, so it has something to say only when you run <code>check</code> with two snapshots. We will return to that: it is the source of a famous false pass in chapter 9.</p>

<h3>One test file, every operator</h3>
<p>This file tries each operator on the OSPF neighbours of J2. Arguments follow the field name, separated by commas.</p>
<pre class="code">tests_include:
  - toolbox_ospf
toolbox_ospf:
  - command: show ospf neighbor
  - iterate:
      xpath: ospf-neighbor
      id: neighbor-address
      tests:
        - is-equal: ospf-neighbor-state, Full
        - not-equal: ospf-neighbor-state, Down
        - is-gt: neighbor-priority, 100
        - in-range: neighbor-priority, 1, 255
        - is-in: interface-name, ge-0/0/0.0, ge-0/0/1.0, ge-0/0/2.0
        - contains: neighbor-id, 10.255.0
        - exists: activity-timer
        - not-exists: bogus-field
        - all-same: ospf-neighbor-state
        - delta: activity-timer, 50%</pre>
<pre class="out">AUTO01$ python3 toolbox.py
**************************** Device: 10.99.0.12 ****************************
Tests Included: toolbox_ospf
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 4 matched ]
PASS | All "ospf-neighbor-state" is not equal to "Down" [ 4 matched ]
PASS | All "neighbor-priority" is greater than "100" [ 4 matched ]
<span class="hl">PASS | All "neighbor-priority" is in range "1" to "255" [ 4 matched ]</span>
PASS | All "interface-name" is in [ ge-0/0/0.0, ge-0/0/1.0, ge-0/0/2.0 ] [ 4 matched ]
PASS | All "neighbor-id" contains "10.255.0" [ 4 matched ]
PASS | All "activity-timer" exists [ 4 matched ]
PASS | All "bogus-field" does not exist [ 4 matched ]
PASS | All "ospf-neighbor-state" are all the same [ 4 matched ]
PASS | All "activity-timer" changed by less than "50%" [ 4 matched ]
------------------------------ Final Result!! ------------------------------
toolbox_ospf : Passed
Total No of tests passed: 10
Total No of tests failed: 0
Overall Tests passed!!!
10.99.0.12 Passed 10 0</pre>
<p>Each line begins with PASS or FAIL, quotes the field, repeats the operator in words and ends with <code>[ 4 matched ]</code>: the count of nodes that satisfied it. A result of <code>[ 0 matched ]</code> with a PASS would be a red flag, which chapter 9 explains. Note <code>not-exists: bogus-field</code> passed: it passes for <i>any</i> misspelled field, a useful fact when you debug and a hazard when you write.</p>

<h3>Choosing the operators for a real health check</h3>
<table class="cmp"><tr><th>You want to know</th><th>Use</th></tr>
<tr><td>Every OSPF neighbour is Full</td><td><code>is-equal: ospf-neighbor-state, Full</code></td></tr>
<tr><td>No OSPF neighbour disappeared</td><td><code>list-not-less: neighbor-address</code> (needs pre and post)</td></tr>
<tr><td>No BGP peer changed AS</td><td><code>no-diff: peer-as</code> (needs pre and post)</td></tr>
<tr><td>Message counters did not jump wildly</td><td><code>delta: input-messages, 80%</code> (needs pre and post)</td></tr>
<tr><td>All routers run the same version</td><td><code>all-same: version</code></td></tr>
<tr><td>An interface is up</td><td><code>is-equal: oper-status, up</code></td></tr></table>

<h3>Asking with an RPC and arguments</h3>
<p>Not every question has a nice CLI command. With <code>rpc:</code> you name the RPC and pass arguments with <code>kwargs</code>, the same arguments as the PyEZ method: <code>get_interface_information(terse=True, interface_name="ge-0/0/0")</code>. The <code>err</code> text can use <code>id_0</code>, the first id, instead of <code>post[...]</code>.</p>
<pre class="code">tests_include:
  - rpc_uplink
  - bgp_first_only
rpc_uplink:
  - rpc: get-interface-information
  - kwargs:
      terse: True
      interface_name: ge-0/0/0
  - iterate:
      xpath: physical-interface
      id: name
      tests:
        - is-equal: oper-status, up
          err: "Interface {{id_0}} is {{post['oper-status']}}"
bgp_first_only:
  - command: show bgp summary
  - item:
      xpath: bgp-peer
      tests:
        - is-equal: peer-state, Established</pre>
<pre class="out">AUTO01$ python3 rpcdemo.py
**************************** Device: 10.99.0.12 ****************************
Tests Included: rpc_uplink, bgp_first_only
*************************** Command: get-interface-information ***************************
<span class="hl">PASS | All "oper-status" is equal to "up" [ 1 matched ]</span>
*************************** Command: show bgp summary ***************************
<span class="hl">PASS | All "peer-state" is equal to "Established" [ 1 matched ]</span>
------------------------------ Final Result!! ------------------------------
rpc_uplink : Passed
bgp_first_only : Passed
Total No of tests passed: 2
Total No of tests failed: 0
Overall Tests passed!!!
10.99.0.12 Passed 2 0</pre>
<p>Look at the second test, <code>bgp_first_only</code>. J2 has two BGP peers but the result says <code>[ 1 matched ]</code>. <b><code>item</code> tests only the first node found</b>; <b><code>iterate</code> tests all of them</b>. Use <code>item</code> for a single-row answer such as a summary count, and <code>iterate</code> for lists of neighbours, peers and interfaces. Mixing them up is one of the four sloppy tests you will hunt in Lab 2.</p>

<div class="eg"><p><b>Worked example.</b> You want the rule "J2 must always have at least three OSPF neighbours and each must be Full". A single operator cannot say both. Write two tests under the same <code>iterate</code>: <code>is-equal: ospf-neighbor-state, Full</code> proves the neighbours that exist are healthy, and <code>list-not-less: neighbor-address</code> proves none was lost. Together they are strictly stronger than either one.</p></div>

<h3>Messages: err and info</h3>
<p>A failure line that says only "Value of ospf-neighbor-state is 2Way" makes the reader hunt. Add <code>err: "OSPF neighbor {{post['neighbor-address']}} on {{post['interface-name']}} is {{post['ospf-neighbor-state']}}, expected Full"</code> and the on-call engineer reads the answer in the log. <code>pre['field']</code> gives the value from the first snapshot, which is how you write "BGP peer was Established, now Idle".</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>not-exists</code> to prove something is absent without checking the field name; a typo passes silently. (2) <code>is-gt</code> and <code>is-lt</code> compare numbers; a field that holds text such as <code>Full</code> never satisfies them. (3) Writing <code>delta: activity-timer, 50%</code> and expecting it to fire in <code>snapcheck</code>; with one snapshot there is nothing to subtract. (4) Forgetting that a test inside <code>item</code> sees one node only.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>list-not-less</code> asks "did any entry of the pre list vanish?" and ignores new entries; <code>list-not-more</code> is the mirror image. <code>no-diff</code> asks about a field's value, not about the list. Pick by the question you want answered.</p></div>

<div class="scn"><h4>The counter that tripped the alarm</h4><p>A team added <code>no-diff: input-messages</code> to a BGP test. Every check failed, because the message counter rises all the time. They changed it to <code>delta: input-messages, 80%</code>, which tolerates normal growth and only fails when the counter moves wildly, for example after a session reset.</p><p><b>Lesson:</b> match the operator to how the field behaves: constants get <code>no-diff</code>, counters get <code>delta</code>.</p></div>

<div class="iv"><p class="q">"How do you check that no OSPF neighbour was lost, not only that the remaining ones are Full?"</p><p>I use <code>is-equal</code> on the state for the neighbours that exist and <code>list-not-less</code> on the neighbour address, run in <code>check</code> with a pre and a post snapshot. The second operator is the one that notices a missing neighbour.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operators come in four groups: one value, presence, across nodes, across snapshots.</li>
<li>The last group (<code>no-diff</code>, <code>delta</code>, <code>list-not-less</code>, <code>list-not-more</code>) needs two snapshots.</li>
<li><code>iterate</code> tests every node; <code>item</code> tests the first only.</li>
<li><code>rpc</code> with <code>kwargs</code> asks for things a CLI command cannot express cleanly.</li>
<li>Write <code>err</code> and <code>info</code> messages that name the node and the value.</li>
</ul></div>
`,hi:`
<p>Test file network ke baare mein vaakyon ki list hai: "har neighbour Full hai", "priority 1 se 255 ke beech hai", "peers ki list chhoti nahi hui". Un vaakyon ko banane wale shabd JSNAPy ke <b>operators</b> hain. Poora set jaanne se aap aisa check likh paate ho jo sach mein wahi test kare jiski aapko parwah hai, na ki aisa jo sirf vyast dikhta hai.</p>

<h3>Operators chaar groups mein</h3>
<table class="cmp"><tr><th>Group</th><th>Operators</th><th>Aise padho</th></tr>
<tr><td>Ek value compare karo</td><td><code>is-equal</code>, <code>not-equal</code>, <code>is-gt</code>, <code>is-lt</code>, <code>in-range</code>, <code>not-range</code>, <code>contains</code>, <code>not-contains</code>, <code>is-in</code>, <code>not-in</code></td><td>Field barabar (nahi), bada, range mein, list ke andar hai</td></tr>
<tr><td>Maujoodgi</td><td><code>exists</code>, <code>not-exists</code></td><td>Field maujood (nahi) hai</td></tr>
<tr><td>Nodes ke beech dekho</td><td><code>all-same</code></td><td>Har node ki value same hai</td></tr>
<tr><td>Snapshots ke beech dekho</td><td><code>no-diff</code>, <code>delta</code>, <code>list-not-less</code>, <code>list-not-more</code></td><td>Badla nahi, X se kam badla, koi entry khoyi nahi, koi entry judi nahi</td></tr></table>
<p>Pehle teen groups ek snapshot ko judge karte hain. Aakhri group <b>pre ko post se</b> compare karta hai, isliye woh tabhi kuch kehta hai jab aap do snapshots ke saath <code>check</code> chalao. Hum yahan wapas aayenge: yeh chapter 9 ke mashhoor false pass ka source hai.</p>

<h3>Ek test file, har operator</h3>
<p>Yeh file J2 ke OSPF neighbours par har operator try karti hai. Arguments field ke naam ke baad comma se alag hote hain.</p>
<pre class="code">tests_include:
  - toolbox_ospf
toolbox_ospf:
  - command: show ospf neighbor
  - iterate:
      xpath: ospf-neighbor
      id: neighbor-address
      tests:
        - is-equal: ospf-neighbor-state, Full
        - not-equal: ospf-neighbor-state, Down
        - is-gt: neighbor-priority, 100
        - in-range: neighbor-priority, 1, 255
        - is-in: interface-name, ge-0/0/0.0, ge-0/0/1.0, ge-0/0/2.0
        - contains: neighbor-id, 10.255.0
        - exists: activity-timer
        - not-exists: bogus-field
        - all-same: ospf-neighbor-state
        - delta: activity-timer, 50%</pre>
<pre class="out">AUTO01$ python3 toolbox.py
**************************** Device: 10.99.0.12 ****************************
Tests Included: toolbox_ospf
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 4 matched ]
PASS | All "ospf-neighbor-state" is not equal to "Down" [ 4 matched ]
PASS | All "neighbor-priority" is greater than "100" [ 4 matched ]
<span class="hl">PASS | All "neighbor-priority" is in range "1" to "255" [ 4 matched ]</span>
PASS | All "interface-name" is in [ ge-0/0/0.0, ge-0/0/1.0, ge-0/0/2.0 ] [ 4 matched ]
PASS | All "neighbor-id" contains "10.255.0" [ 4 matched ]
PASS | All "activity-timer" exists [ 4 matched ]
PASS | All "bogus-field" does not exist [ 4 matched ]
PASS | All "ospf-neighbor-state" are all the same [ 4 matched ]
PASS | All "activity-timer" changed by less than "50%" [ 4 matched ]
------------------------------ Final Result!! ------------------------------
toolbox_ospf : Passed
Total No of tests passed: 10
Total No of tests failed: 0
Overall Tests passed!!!
10.99.0.12 Passed 10 0</pre>
<p>Har line PASS ya FAIL se shuru hoti hai, field ko quote karti hai, operator ko shabdon mein dohrati hai aur <code>[ 4 matched ]</code> par khatam hoti hai: un nodes ki ginti jinhone use satisfy kiya. PASS ke saath <code>[ 0 matched ]</code> red flag hoga, jise chapter 9 samjhata hai. Dhyan do <code>not-exists: bogus-field</code> pass hua: yeh <i>kisi bhi</i> galat spelling wali field ke liye pass hota hai, jo debug karte waqt kaam ki baat hai aur likhte waqt khatra.</p>

<h3>Asli health check ke liye operators chunna</h3>
<table class="cmp"><tr><th>Aap kya jaanna chahte ho</th><th>Use karo</th></tr>
<tr><td>Har OSPF neighbour Full hai</td><td><code>is-equal: ospf-neighbor-state, Full</code></td></tr>
<tr><td>Koi OSPF neighbour gayab nahi hua</td><td><code>list-not-less: neighbor-address</code> (pre aur post chahiye)</td></tr>
<tr><td>Kisi BGP peer ka AS nahi badla</td><td><code>no-diff: peer-as</code> (pre aur post chahiye)</td></tr>
<tr><td>Message counters bahut ooche nahi kude</td><td><code>delta: input-messages, 80%</code> (pre aur post chahiye)</td></tr>
<tr><td>Sab routers ek hi version chalate hain</td><td><code>all-same: version</code></td></tr>
<tr><td>Interface up hai</td><td><code>is-equal: oper-status, up</code></td></tr></table>

<h3>RPC aur arguments ke saath poochhna</h3>
<p>Har sawaal ke liye achhi CLI command nahi hoti. <code>rpc:</code> se aap RPC ka naam dete ho aur <code>kwargs</code> se arguments, wahi arguments jo PyEZ method ke hain: <code>get_interface_information(terse=True, interface_name="ge-0/0/0")</code>. <code>err</code> text <code>post[...]</code> ki jagah <code>id_0</code>, pehla id, use kar sakta hai.</p>
<pre class="code">tests_include:
  - rpc_uplink
  - bgp_first_only
rpc_uplink:
  - rpc: get-interface-information
  - kwargs:
      terse: True
      interface_name: ge-0/0/0
  - iterate:
      xpath: physical-interface
      id: name
      tests:
        - is-equal: oper-status, up
          err: "Interface {{id_0}} is {{post['oper-status']}}"
bgp_first_only:
  - command: show bgp summary
  - item:
      xpath: bgp-peer
      tests:
        - is-equal: peer-state, Established</pre>
<pre class="out">AUTO01$ python3 rpcdemo.py
**************************** Device: 10.99.0.12 ****************************
Tests Included: rpc_uplink, bgp_first_only
*************************** Command: get-interface-information ***************************
<span class="hl">PASS | All "oper-status" is equal to "up" [ 1 matched ]</span>
*************************** Command: show bgp summary ***************************
<span class="hl">PASS | All "peer-state" is equal to "Established" [ 1 matched ]</span>
------------------------------ Final Result!! ------------------------------
rpc_uplink : Passed
bgp_first_only : Passed
Total No of tests passed: 2
Total No of tests failed: 0
Overall Tests passed!!!
10.99.0.12 Passed 2 0</pre>
<p>Doosra test <code>bgp_first_only</code> dekho. J2 ke do BGP peers hain par result <code>[ 1 matched ]</code> kehta hai. <b><code>item</code> sirf pehla mila node test karta hai</b>; <b><code>iterate</code> sab ko test karta hai</b>. Summary count jaise ek-row wale jawab ke liye <code>item</code>, aur neighbours, peers aur interfaces ki lists ke liye <code>iterate</code> use karo. Inhe ulta-seedha karna un chaar laparwah tests mein se ek hai jo aap Lab 2 mein dhoondhoge.</p>

<div class="eg"><p><b>Worked example.</b> Aap rule chahte ho "J2 ke hamesha kam se kam teen OSPF neighbours hon aur har ek Full ho". Ek operator dono nahi keh sakta. Ek hi <code>iterate</code> ke neeche do tests likho: <code>is-equal: ospf-neighbor-state, Full</code> saabit karta hai ki jo neighbours maujood hain woh healthy hain, aur <code>list-not-less: neighbor-address</code> saabit karta hai ki koi khoya nahi. Dono saath mein kisi bhi ek se kaafi mazboot hain.</p></div>

<h3>Messages: err aur info</h3>
<p>Jo failure line sirf "Value of ospf-neighbor-state is 2Way" kahe, woh padhne wale ko khojne par majboor karti hai. <code>err: "OSPF neighbor {{post['neighbor-address']}} on {{post['interface-name']}} is {{post['ospf-neighbor-state']}}, expected Full"</code> jodo aur on-call engineer jawab log mein padh leta hai. <code>pre['field']</code> pehle snapshot ki value deta hai, jisse aap "BGP peer Established tha, ab Idle hai" likhte ho.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>not-exists</code> se saabit karna ki kuch absent hai bina field name check kiye; typo chupchaap pass ho jaata hai. (2) <code>is-gt</code> aur <code>is-lt</code> numbers compare karte hain; <code>Full</code> jaisa text wali field unhe kabhi satisfy nahi karti. (3) <code>delta: activity-timer, 50%</code> likhkar <code>snapcheck</code> mein uske fire hone ki ummeed karna; ek snapshot mein ghatane ko kuch nahi hota. (4) Yeh bhoolna ki <code>item</code> ke andar ka test sirf ek node dekhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>list-not-less</code> poochhta hai "kya pre list ki koi entry gayab hui?" aur nayi entries ko ignore karta hai; <code>list-not-more</code> uska aaina hai. <code>no-diff</code> field ki value ke baare mein poochhta hai, list ke baare mein nahi. Jo sawaal ka jawab chahiye uske hisaab se chuno.</p></div>

<div class="scn"><h4>Counter jisne alarm baja diya</h4><p>Ek team ne BGP test mein <code>no-diff: input-messages</code> joda. Har check fail hone laga, kyunki message counter hamesha badhta hai. Unhone ise <code>delta: input-messages, 80%</code> kar diya, jo normal growth ko sehta hai aur tabhi fail hota hai jab counter bahut kude, jaise session reset ke baad.</p><p><b>Lesson:</b> operator ko field ke vyavhar se milao: constants ke liye <code>no-diff</code>, counters ke liye <code>delta</code>.</p></div>

<div class="iv"><p class="q">"Aap kaise check karte ho ki koi OSPF neighbour khoya nahi, sirf yeh nahi ki bache hue Full hain?"</p><p>Jo neighbours maujood hain unki state par <code>is-equal</code>, aur neighbour address par <code>list-not-less</code>, dono <code>check</code> mein pre aur post snapshot ke saath. Doosra operator hi missing neighbour ko notice karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operators chaar groups mein hain: ek value, maujoodgi, nodes ke beech, snapshots ke beech.</li>
<li>Aakhri group (<code>no-diff</code>, <code>delta</code>, <code>list-not-less</code>, <code>list-not-more</code>) ko do snapshots chahiye.</li>
<li><code>iterate</code> har node test karta hai; <code>item</code> sirf pehla.</li>
<li><code>kwargs</code> ke saath <code>rpc</code> woh poochhta hai jo CLI command saaf tareeke se nahi keh sakti.</li>
<li><code>err</code> aur <code>info</code> messages mein node aur value ka naam likho.</li>
</ul></div>
`}};export{e as default};