var e={id:`reading-failures`,h:{en:`Reading a failed test: from AssertionError to root cause`,hi:`Failed test padhna: AssertionError se root cause tak`},body:{en:`
<p>A failing test is not bad news. It is a <b>pointer</b>. A good test failure tells you which device, which fact and what the difference is. This chapter shows how to turn a failure into a router command in under a minute, using the first failure of lab 2 (the Kaveri Foods "Internet is down" ticket).</p>

<h3>Analogy: the check-engine light and the mechanic's scanner</h3>
<p>A car's warning light says only "something is wrong". The mechanic plugs in a scanner, which prints a code such as "cylinder 3 misfire". The code does not fix the car, but it tells the mechanic where to open the bonnet. Your test suite is the scanner: the assertion message is the code.</p>

<h3>The reading routine: four questions</h3>
<ol>
<li><b>Which test?</b> Look at the function name in the traceback line "in test_...".</li>
<li><b>Which device?</b> The message should start with it.</li>
<li><b>What was seen and what was expected?</b> The two numbers or words in the message.</li>
<li><b>What is the likeliest cause?</b> Use your protocol knowledge to turn the difference into a hypothesis, then check it with a show command.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Failure to command">
<rect x="10" y="40" width="140" height="60" rx="10" fill="#fed7aa"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">AssertionError</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="12">R2: 1 FULL, want 2</text>
<rect x="190" y="40" width="130" height="60" rx="10" fill="#fde68a"/><text x="255" y="66" text-anchor="middle" class="svg-ink" font-size="13">Hypothesis</text><text x="255" y="84" text-anchor="middle" class="svg-muted" font-size="12">adjacency stuck</text>
<rect x="360" y="40" width="130" height="60" rx="10" fill="#bae6fd"/><text x="425" y="66" text-anchor="middle" class="svg-ink" font-size="13">show command</text><text x="425" y="84" text-anchor="middle" class="svg-muted" font-size="12">ospf interface</text>
<rect x="530" y="40" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="580" y="66" text-anchor="middle" class="svg-ink" font-size="13">Fix</text><text x="580" y="84" text-anchor="middle" class="svg-muted" font-size="12">then rerun</text>
<line x1="150" y1="70" x2="190" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="360" y2="70" stroke="#64748b" stroke-width="2"/><line x1="490" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Failure message, hypothesis, one show command, fix.</p></div>

<h3>Worked failure: the missing OSPF neighbour</h3>
<p>The ticket: after a night change users say the Internet is down at the branch. Instead of guessing, run the suite. This is the real output:</p>
<pre class="out">AUTO&gt; python3 tests.py
Traceback (most recent call last):
  File "tests.py", line 44, in &lt;module&gt;
    test()
  File "tests.py", line 25, in test_ospf_neighbors
    assert full == expected[router], f"{router} has {full} FULL OSPF neighbours, expected {expected[router]}"
<span class="hl">AssertionError: R2 has 1 FULL OSPF neighbours, expected 2</span></pre>
<p>Answer the four questions. Test: <code>test_ospf_neighbors</code>. Device: R2. Seen 1, expected 2. R2 is the middle router; it has lost one neighbour, either R1 or R3. The loop checks routers in order R1, R2, R3, and R1 passed, so R1 still has its single neighbour, which is R2. The missing adjacency is therefore between R2 and R3.</p>
<p>Now apply protocol knowledge. Two OSPF neighbours stay below FULL for a handful of reasons: mismatched hello and dead timers, area ID, authentication, subnet or MTU. The lab brief says all timers should be default, so compare the timers on both ends of the R2-R3 link:</p>
<pre class="code">R2# show ip ospf interface GigabitEthernet0/2
R3# show ip ospf interface GigabitEthernet0/1
<span class="c">! look at the line "Timer intervals configured, Hello ..., Dead ..."</span></pre>
<p>On R3 the hello interval has been set to 5 seconds while R2 uses the default of 10. OSPF routers must agree on hello and dead intervals to form an adjacency. The fix is to remove the non-default setting on R3 so it falls back to the default:</p>
<pre class="code">R3# configure terminal
R3(config)# interface GigabitEthernet0/1
R3(config-if)# no ip ospf hello-interval
R3(config-if)# end</pre>
<p>After the adjacency re-forms (give it up to thirty seconds), rerun the suite. The first test now passes. Remember: a test run is also a <b>verification</b> of your fix, not only a diagnosis.</p>

<div class="eg"><p><b>Worked example.</b> Suppose the message had read "R1 has 0 FULL OSPF neighbours, expected 1". Same test, but a different device. Now R1 is isolated: its link to R2 is the suspect. You would run <code>show ip ospf neighbor</code> and <code>show ip interface brief</code> on R1 first. The message chose your first command for you.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Fixing what the test points at without understanding why. The test pointed at R2, but the faulty setting was on R3. Always follow the evidence to the root cause; the device named in the message is where the <i>symptom</i> shows, not always where the <i>fault</i> is.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the OSPF adjacency checklist: hello and dead timers, area ID, subnet and mask, authentication, MTU, stub flags and router-id uniqueness. A timer mismatch leaves neighbours missing, not stuck in a half state.</p></div>

<div class="scn"><h4>Same symptom, different cause</h4><p>Two weeks after the timer fault a different branch showed the same message: "expected 2, found 1". This time the timers matched. An access list on the link was blocking OSPF packets. The test pointed to the same place, but the engineer's four-question routine ruled out timers in one command and moved on to the filter.</p><p><b>Lesson:</b> the test tells you where to look; your protocol knowledge tells you what you will find.</p></div>

<div class="iv"><p class="q">"A post-change test says a router has fewer OSPF neighbours than expected. What do you do?"</p><p>Read which router and by how much, identify the missing neighbour from the topology, then check the adjacency requirements on that link: timers, area, subnet, authentication, MTU, ACLs. Use show ip ospf interface and show ip ospf neighbor on both ends, fix, and rerun the test to prove it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A failed test is a pointer: test name, device, seen value, expected value.</li>
<li>Turn the difference into a hypothesis, then verify with one show command.</li>
<li>OSPF neighbours need matching hello and dead timers (and area, subnet, authentication).</li>
<li>The device in the message shows the symptom, not necessarily the fault.</li>
<li>Rerun the test after the fix; it is your proof.</li>
</ul></div>
`,hi:`
<p>Failing test buri khabar nahi hai. Woh ek <b>pointer</b> hai. Achha test failure batata hai kaunsa device, kaunsa fact aur farak kya hai. Yeh chapter dikhata hai ki failure ko ek minute mein router command mein kaise badlein, lab 2 ke pehle failure (Kaveri Foods ka "Internet down hai" ticket) se.</p>

<h3>Analogy: check-engine light aur mechanic ka scanner</h3>
<p>Gaadi ki warning light sirf kehti hai "kuch galat hai". Mechanic scanner lagata hai, jo "cylinder 3 misfire" jaisa code print karta hai. Code gaadi theek nahi karta, par mechanic ko batata hai bonnet kahan kholna hai. Aapka test suite scanner hai: assertion message code hai.</p>

<h3>Padhne ka routine: chaar sawaal</h3>
<ol>
<li><b>Kaunsa test?</b> Traceback ki line "in test_..." ka function naam dekho.</li>
<li><b>Kaunsa device?</b> Message usse shuru hona chahiye.</li>
<li><b>Kya dekha aur kya expected tha?</b> Message ke do numbers ya shabd.</li>
<li><b>Sabse likely wajah kya hai?</b> Protocol ke gyaan se farak ko hypothesis mein badlo, phir show command se check karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Failure se command tak">
<rect x="10" y="40" width="140" height="60" rx="10" fill="#fed7aa"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">AssertionError</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="12">R2: 1 FULL, want 2</text>
<rect x="190" y="40" width="130" height="60" rx="10" fill="#fde68a"/><text x="255" y="66" text-anchor="middle" class="svg-ink" font-size="13">Hypothesis</text><text x="255" y="84" text-anchor="middle" class="svg-muted" font-size="12">adjacency atki</text>
<rect x="360" y="40" width="130" height="60" rx="10" fill="#bae6fd"/><text x="425" y="66" text-anchor="middle" class="svg-ink" font-size="13">show command</text><text x="425" y="84" text-anchor="middle" class="svg-muted" font-size="12">ospf interface</text>
<rect x="530" y="40" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="580" y="66" text-anchor="middle" class="svg-ink" font-size="13">Fix</text><text x="580" y="84" text-anchor="middle" class="svg-muted" font-size="12">phir rerun</text>
<line x1="150" y1="70" x2="190" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="360" y2="70" stroke="#64748b" stroke-width="2"/><line x1="490" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Failure message, hypothesis, ek show command, fix.</p></div>

<h3>Worked failure: gayab OSPF neighbour</h3>
<p>Ticket: raat ke change ke baad users kehte hain branch par Internet band hai. Guess karne ki jagah suite chalao. Yeh real output hai:</p>
<pre class="out">AUTO&gt; python3 tests.py
Traceback (most recent call last):
  File "tests.py", line 44, in &lt;module&gt;
    test()
  File "tests.py", line 25, in test_ospf_neighbors
    assert full == expected[router], f"{router} has {full} FULL OSPF neighbours, expected {expected[router]}"
<span class="hl">AssertionError: R2 has 1 FULL OSPF neighbours, expected 2</span></pre>
<p>Chaar sawaalon ke jawab do. Test: <code>test_ospf_neighbors</code>. Device: R2. Dekha 1, expected 2. R2 beech ka router hai; usne ek neighbour kho diya, R1 ya R3. Loop routers ko R1, R2, R3 order mein check karta hai, aur R1 pass hua, yaani R1 ka ek neighbour (R2) abhi hai. Isliye gayab adjacency R2 aur R3 ke beech hai.</p>
<p>Ab protocol ka gyaan lagao. Do OSPF neighbours kuch wajahon se FULL se neeche rehte hain: hello aur dead timers ka mismatch, area ID, authentication, subnet ya MTU. Lab brief kehta hai saare timers default hone chahiye, isliye R2-R3 link ke dono sirey par timers compare karo:</p>
<pre class="code">R2# show ip ospf interface GigabitEthernet0/2
R3# show ip ospf interface GigabitEthernet0/1
<span class="c">! "Timer intervals configured, Hello ..., Dead ..." wali line dekho</span></pre>
<p>R3 par hello interval 5 seconds set hai jabki R2 default 10 use karta hai. OSPF routers ko adjacency banane ke liye hello aur dead intervals par sahmat hona padta hai. Fix: R3 par non-default setting hata do taaki woh default par lautey:</p>
<pre class="code">R3# configure terminal
R3(config)# interface GigabitEthernet0/1
R3(config-if)# no ip ospf hello-interval
R3(config-if)# end</pre>
<p>Adjacency dobara banne ke baad (tees seconds tak do), suite dobara chalao. Pehla test ab pass hota hai. Yaad rakho: test run aapke fix ka <b>verification</b> bhi hai, sirf diagnosis nahi.</p>

<div class="eg"><p><b>Worked example.</b> Maan lo message hota "R1 has 0 FULL OSPF neighbours, expected 1". Wahi test, par alag device. Ab R1 alag-thalag hai: R2 se uska link shak ke ghere mein hai. Aap pehle R1 par <code>show ip ospf neighbor</code> aur <code>show ip interface brief</code> chalate. Message ne aapka pehla command chun diya.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Test jahan point kare wahin fix karna bina samjhe kyun. Test R2 ki taraf point kar raha tha, par galat setting R3 par thi. Hamesha evidence ko root cause tak follow karo; message mein device wahan hai jahan <i>symptom</i> dikhta hai, zaroori nahi jahan <i>fault</i> hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF adjacency checklist jaano: hello aur dead timers, area ID, subnet aur mask, authentication, MTU, stub flags aur router-id ka unique hona. Timer mismatch mein neighbour missing hota hai, aadhi state mein atka nahi.</p></div>

<div class="scn"><h4>Symptom wahi, wajah alag</h4><p>Timer fault ke do hafte baad ek aur branch ne wahi message dikhaya: "expected 2, found 1". Is baar timers match the. Link par ek access list OSPF packets rok rahi thi. Test usi jagah ishara kar raha tha, par engineer ke chaar sawaal wale routine ne ek command mein timers ko rule out kiya aur filter par gaya.</p><p><b>Lesson:</b> test batata hai kahan dekhna hai; aapka protocol gyaan batata hai wahan kya milega.</p></div>

<div class="iv"><p class="q">"Change ke baad test kehta hai router ke OSPF neighbours expected se kam hain. Kya karoge?"</p><p>Padho kaunsa router aur kitna kam, topology se gayab neighbour pehchano, phir us link par adjacency requirements check karo: timers, area, subnet, authentication, MTU, ACLs. Dono sirey par show ip ospf interface aur show ip ospf neighbor chalao, fix karo, aur test dobara chalakar prove karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failed test ek pointer hai: test ka naam, device, dekhi value, expected value.</li>
<li>Farak ko hypothesis banao, phir ek show command se verify karo.</li>
<li>OSPF neighbours ko matching hello aur dead timers (aur area, subnet, authentication) chahiye.</li>
<li>Message ka device symptom dikhata hai, zaroori nahi fault.</li>
<li>Fix ke baad test dobara chalao; woh aapka saboot hai.</li>
</ul></div>
`}};export{e as default};