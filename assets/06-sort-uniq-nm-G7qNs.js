var e={id:`sort-uniq`,h:{en:`sort and uniq: order, duplicates and counting`,hi:`sort aur uniq: order, duplicates aur counting`},body:{en:`
<p><b>The idea of this chapter:</b> <code>sort</code> puts lines in order and <code>uniq</code> collapses <b>neighbouring</b> duplicate lines. Together, <code>sort | uniq -c | sort -rn</code> is the most useful counting recipe in Linux: "which device, IP or error appears most often?"</p>

<h3>sort</h3>
<pre class="out">netadmin@nms01:~$ sort devices.csv
BLR-EDGE-R2,10.20.0.1,Bengaluru
CHN-EDGE-R4,10.50.0.1,Chennai
HYD-EDGE-R3,10.40.3.1,Hyderabad
PUN-CORE-R1,10.10.0.1,Pune
hostname,ip,site
netadmin@nms01:~$ sort -r devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,Pune
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai
BLR-EDGE-R2,10.20.0.1,Bengaluru</pre>
<p><code>-r</code> reverses the order. Notice that the header line <code>hostname,ip,site</code> sorted to the <b>bottom</b>: with the plain "C" sort order that this server uses, capital letters come before small letters. A server with an English (en_US) locale may mix them differently, so never rely on it; remove the header with <code>tail -n +2</code> first.</p>

<h3>Text order versus number order</h3>
<pre class="out">netadmin@nms01:~$ printf "10\\n9\\n100\\n" | sort
10
100
9
netadmin@nms01:~$ printf "10\\n9\\n100\\n" | sort -n
9
10
100</pre>
<p>Plain <code>sort</code> compares character by character, so "100" comes before "9" (the character 1 is smaller than 9). <b>Use <code>-n</code> for numbers</b>. This is the classic mistake when sorting port numbers, VLAN IDs or counts. <code>sort -rn</code> gives the biggest number first.</p>

<h3>Sorting by a column</h3>
<p><code>-t,</code> sets the separator and <code>-k3</code> chooses column 3 as the sort key:</p>
<pre class="out">netadmin@nms01:~$ sort -t, -k3 devices.csv
BLR-EDGE-R2,10.20.0.1,Bengaluru
CHN-EDGE-R4,10.50.0.1,Chennai
HYD-EDGE-R3,10.40.3.1,Hyderabad
PUN-CORE-R1,10.10.0.1,Pune
hostname,ip,site</pre>

<h3>uniq: remove duplicates, but only next to each other</h3>
<pre class="out">netadmin@nms01:~$ printf "b\\na\\nb\\nb\\na\\n" | uniq
b
a
b
a
netadmin@nms01:~$ printf "b\\na\\nb\\nb\\na\\n" | sort | uniq
a
b
netadmin@nms01:~$ printf "b\\na\\nb\\nb\\na\\n" | sort | uniq -c
      2 a
      3 b</pre>
<p><code>uniq</code> only merges duplicates that are <b>side by side</b>, so the first run still shows b, a, b, a. That is why <code>sort</code> always comes first: it brings equal lines together. <code>-c</code> adds a count in front: "a appeared twice, b three times". The short form <code>sort -u</code> does <code>sort | uniq</code> in one step but gives no count.</p>

<h3>The counting recipe</h3>
<pre class="code">... | sort | uniq -c | sort -rn | head</pre>
<p>Read it as four steps: bring equal lines together, count them, put the biggest count on top, keep the first few. Here it counts log lines per router:</p>
<pre class="out">netadmin@nms01:~$ awk '{print $4}' /var/log/remote/routers.log | sort | uniq -c
      4 10.10.0.1
     17 10.20.0.1
      7 10.40.3.1
      2 10.50.0.1</pre>
<p>Router 10.20.0.1 sent 17 of the 30 lines. Which message types are common? Extract the message code with <code>grep -oE</code> and count it:</p>
<pre class="out">netadmin@nms01:~$ grep -oE "%[A-Z]+-[0-9]-[A-Z_]+" /var/log/remote/routers.log | sort | uniq -c | sort -rn
     22 %LINEPROTO-5-UPDOWN
      3 %SYS-5-CONFIG_I
      2 %OSPF-5-ADJCHG
      1 %LINK-3-UPDOWN</pre>
<p>Twenty-two link up/down events out of 28 messages is a flapping signal at a glance. Compare this with reading the raw file line by line.</p>

<p><b>Reference commands (not run in the simulator):</b> options you will meet on real servers.</p>
<pre class="code">sort -k2,2 -t, -n file.csv     # numeric sort on column 2 only
sort -V versions.txt           # natural version order (1.9 before 1.10)
sort -h sizes.txt              # human sizes (2K, 1M, 3G), pairs with du -h
uniq -d file                   # show only lines that repeat
uniq -u file                   # show only lines that never repeat</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>uniq</code> without <code>sort</code>: the duplicates are not next to each other, so nothing is merged. (2) Sorting numbers without <code>-n</code>: 100 before 9. (3) <code>sort -u</code> and <code>uniq -c</code> are different: <code>-u</code> never counts. (4) Forgetting <code>-rn</code> on the last sort, so the top talker is at the bottom.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which command shows how many times each IP appears, most frequent first?" Answer: <code>sort | uniq -c | sort -rn</code>. <code>uniq</code> alone only removes adjacent duplicates.</p></div>

<div class="scn"><h4>The blocklist that was too long</h4><p>A teammate built a firewall blocklist from a log with <code>awk '{print $4}' log | uniq</code>. The result still held the same address 40 times, scattered in groups, and the firewall import was rejected as too long. Adding <code>sort -u</code> before the import cut it to 6 unique addresses.</p><p><b>Lesson:</b> sort before uniq, every time.</p></div>

<div class="iv"><p class="q">"How would you find the most frequent value in a column of a log?"</p><p>I extract the column with <code>awk</code> or <code>cut</code>, pipe it to <code>sort</code> so equal values are adjacent, then <code>uniq -c</code> to count, then <code>sort -rn</code> for the highest count first, and <code>head</code> for the top few. I use <code>sort -n</code> whenever the values are numbers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>sort</code> orders lines; <code>-r</code> reverses; <code>-n</code> sorts numbers; <code>-t -k</code> picks a column.</li>
<li><code>uniq</code> merges only neighbouring duplicates, so sort first.</li>
<li><code>uniq -c</code> counts; <code>sort -u</code> only de-duplicates.</li>
<li>The recipe: <code>sort | uniq -c | sort -rn | head</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>sort</code> lines ko order mein rakhta hai aur <code>uniq</code> <b>paas-paas</b> wali duplicate lines ko ek kar deta hai. Dono milkar <code>sort | uniq -c | sort -rn</code> Linux ki sabse kaam ki counting recipe hai: "kaunsa device, IP ya error sabse zyada aata hai?"</p>

<h3>sort</h3>
<pre class="out">netadmin@nms01:~$ sort devices.csv
BLR-EDGE-R2,10.20.0.1,Bengaluru
CHN-EDGE-R4,10.50.0.1,Chennai
HYD-EDGE-R3,10.40.3.1,Hyderabad
PUN-CORE-R1,10.10.0.1,Pune
hostname,ip,site
netadmin@nms01:~$ sort -r devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,Pune
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai
BLR-EDGE-R2,10.20.0.1,Bengaluru</pre>
<p><code>-r</code> order ulta karta hai. Dekho header line <code>hostname,ip,site</code> <b>sabse neeche</b> gayi: is server ke plain "C" sort order mein capital letters small letters se pehle aate hain. English (en_US) locale wale server par alag mix ho sakta hai, isliye ispar bharosa mat karo; pehle <code>tail -n +2</code> se header hata do.</p>

<h3>Text order aur number order</h3>
<pre class="out">netadmin@nms01:~$ printf "10\\n9\\n100\\n" | sort
10
100
9
netadmin@nms01:~$ printf "10\\n9\\n100\\n" | sort -n
9
10
100</pre>
<p>Plain <code>sort</code> character by character compare karta hai, isliye "100" "9" se pehle aata hai (character 1, 9 se chhota hai). <b>Numbers ke liye <code>-n</code> use karo</b>. Port numbers, VLAN IDs ya counts sort karte waqt yeh classic galti hoti hai. <code>sort -rn</code> sabse bada number pehle deta hai.</p>

<h3>Column se sort karna</h3>
<p><code>-t,</code> separator set karta hai aur <code>-k3</code> column 3 ko sort key banata hai:</p>
<pre class="out">netadmin@nms01:~$ sort -t, -k3 devices.csv
BLR-EDGE-R2,10.20.0.1,Bengaluru
CHN-EDGE-R4,10.50.0.1,Chennai
HYD-EDGE-R3,10.40.3.1,Hyderabad
PUN-CORE-R1,10.10.0.1,Pune
hostname,ip,site</pre>

<h3>uniq: duplicates hatao, par sirf paas-paas wale</h3>
<pre class="out">netadmin@nms01:~$ printf "b\\na\\nb\\nb\\na\\n" | uniq
b
a
b
a
netadmin@nms01:~$ printf "b\\na\\nb\\nb\\na\\n" | sort | uniq
a
b
netadmin@nms01:~$ printf "b\\na\\nb\\nb\\na\\n" | sort | uniq -c
      2 a
      3 b</pre>
<p><code>uniq</code> sirf <b>side by side</b> duplicates ko milata hai, isliye pehli run mein abhi bhi b, a, b, a dikhta hai. Isiliye <code>sort</code> hamesha pehle aata hai: yeh barabar lines ko saath le aata hai. <code>-c</code> aage count jodta hai: "a do baar, b teen baar aaya". Chhota form <code>sort -u</code> ek hi step mein <code>sort | uniq</code> karta hai, par count nahi deta.</p>

<h3>Counting recipe</h3>
<pre class="code">... | sort | uniq -c | sort -rn | head</pre>
<p>Ise chaar steps mein padho: barabar lines saath lao, ginti karo, sabse bada count upar rakho, pehle kuch rakho. Yahan yeh har router ki log lines ginta hai:</p>
<pre class="out">netadmin@nms01:~$ awk '{print $4}' /var/log/remote/routers.log | sort | uniq -c
      4 10.10.0.1
     17 10.20.0.1
      7 10.40.3.1
      2 10.50.0.1</pre>
<p>Router 10.20.0.1 ne 30 mein se 17 lines bheji. Kaunse message types common hain? <code>grep -oE</code> se message code nikalo aur ginti karo:</p>
<pre class="out">netadmin@nms01:~$ grep -oE "%[A-Z]+-[0-9]-[A-Z_]+" /var/log/remote/routers.log | sort | uniq -c | sort -rn
     22 %LINEPROTO-5-UPDOWN
      3 %SYS-5-CONFIG_I
      2 %OSPF-5-ADJCHG
      1 %LINK-3-UPDOWN</pre>
<p>28 messages mein 22 link up/down events ek nazar mein flapping ka signal hain. Isse raw file line by line padhne se compare karo.</p>

<p><b>Reference commands (simulator mein nahi chalte):</b> real servers par milne wale options.</p>
<pre class="code">sort -k2,2 -t, -n file.csv     # sirf column 2 par numeric sort
sort -V versions.txt           # natural version order (1.9 pehle, 1.10 baad mein)
sort -h sizes.txt              # human sizes (2K, 1M, 3G), du -h ke saath
uniq -d file                   # sirf woh lines jo repeat hoti hain
uniq -u file                   # sirf woh lines jo kabhi repeat nahi hoti</pre>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>sort</code> ke bina <code>uniq</code>: duplicates paas-paas nahi hote, isliye kuch merge nahi hota. (2) Numbers ko <code>-n</code> ke bina sort karna: 100, 9 se pehle. (3) <code>sort -u</code> aur <code>uniq -c</code> alag hain: <code>-u</code> kabhi count nahi karta. (4) Aakhri sort mein <code>-rn</code> bhoolna, to top talker neeche reh jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsa command batata hai har IP kitni baar aaya, sabse zyada pehle?" Jawab: <code>sort | uniq -c | sort -rn</code>. Akela <code>uniq</code> sirf adjacent duplicates hatata hai.</p></div>

<div class="scn"><h4>Bahut lambi blocklist</h4><p>Ek teammate ne log se firewall blocklist <code>awk '{print $4}' log | uniq</code> se banayi. Result mein wahi address groups mein bikhra hua 40 baar tha aur firewall import "too long" bol kar reject hua. Import se pehle <code>sort -u</code> lagane se list 6 unique addresses ki ho gayi.</p><p><b>Lesson:</b> uniq se pehle hamesha sort.</p></div>

<div class="iv"><p class="q">"Log ke ek column ki sabse frequent value kaise nikaloge?"</p><p>Main <code>awk</code> ya <code>cut</code> se column nikalta hoon, <code>sort</code> mein pipe karta hoon taaki barabar values paas aa jaayein, phir <code>uniq -c</code> se ginti, phir <code>sort -rn</code> se sabse bada count pehle, aur <code>head</code> se top kuch. Values numbers hon to <code>sort -n</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>sort</code> lines ko order karta hai; <code>-r</code> ulta; <code>-n</code> numbers; <code>-t -k</code> column chunta hai.</li>
<li><code>uniq</code> sirf paas-paas duplicates milata hai, isliye pehle sort.</li>
<li><code>uniq -c</code> ginta hai; <code>sort -u</code> sirf de-duplicate karta hai.</li>
<li>Recipe: <code>sort | uniq -c | sort -rn | head</code>.</li>
</ul></div>
`}};export{e as default};