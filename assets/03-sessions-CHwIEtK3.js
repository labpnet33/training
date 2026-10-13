var e={id:`sessions`,h:{en:`Sessions: show session all, session detail and clear`,hi:`Sessions: show session all, session detail aur clear`},body:{en:`

<p><b>The session table is the truth.</b> Counters tell you what was dropped. Logs tell you what ended. The session table tells you what is alive right now, with the exact decision the firewall made for it. When a user says "it works for some and not for others", you read sessions.</p>

<h3>Analogy: the attendance register</h3>
<p>A training class keeps an attendance register: who is inside the room now, which seat, who let them in. <code>show session all</code> is that register. <code>show session id</code> is the detailed file of one student: which rule admitted them, which application they use, whether their name was changed (NAT).</p>

<h3>Reading show session all</h3>
<p>Each session uses two lines. The first line has the ID, the application, the state, the type, flags, the original source with port and zone, the protocol number, and the translated source in brackets. The second line has the original destination with port and zone and the translated destination. Here is a session from the lab, created after the DMZ web server was allowed to use DNS:</p>
<pre class="out">PA1&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
9361         dns            ACTIVE  FLOW NS    10.0.2.10[57160]/dmz/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[53]/untrust  (8.8.8.8[53])</pre>
<p>Read it like this: server 10.0.2.10 in zone <b>dmz</b> opened TCP (protocol 6) to 8.8.8.8 port 53 in zone <b>untrust</b>. The flag <code>NS</code> means source NAT: the source was translated to 203.0.113.2 with port 60001. The application column says <code>dns</code>, so App-ID classified it, not just the port.</p>
<table class="cmp"><tr><th>Flag</th><th>Meaning</th></tr>
<tr><td>NS</td><td>Source NAT applied</td></tr>
<tr><td>ND</td><td>Destination NAT applied</td></tr>
<tr><td>NB</td><td>Both source and destination NAT</td></tr>
</table>

<h3>Filtering the table</h3>
<p>A busy firewall holds thousands of sessions. Always filter. The lab accepts these filters, combined as keyword and value pairs:</p>
<pre class="code">show session all filter source 10.0.2.10
show session all filter destination 8.8.8.8
show session all filter application dns
show session all filter rule DMZ-Out</pre>
<p>On a real firewall many more filters exist (for example port, ingress interface and zone). The idea is the same: narrow to the one user or server in the ticket.</p>

<h3>Reading show session id</h3>
<p>Take the ID from the table and ask for the detail. These are the lines to read first (output trimmed with <code>...</code>):</p>
<pre class="out">PA1&gt; show session id 9361

Session             9361

	c2s flow:
		source:      10.0.2.10 [dmz]
		dst:         8.8.8.8
		proto:       6
		sport:       57160           dport:      53
		state:       ACTIVE          type:       FLOW
		src user:    unknown
		dst user:    unknown

	s2c flow:
		source:      8.8.8.8 [untrust]
		dst:         203.0.113.2
		proto:       6
		sport:       53              dport:      60001
		state:       ACTIVE          type:       FLOW
	...
	timeout                              : 3600 sec
	application                          : dns
	<span class="hl">rule                                 : DMZ-Out</span>
	address/port translation             : source
	<span class="hl">nat-rule                             : SNAT-Out(vsys1)</span>
	ingress interface                    : ethernet1/3
	egress interface                     : ethernet1/1</pre>
<ul>
<li><b>c2s and s2c flows</b> show both directions. In the s2c flow the destination is the <i>translated</i> address 203.0.113.2: this is the address the internet sees.</li>
<li><b>rule</b> tells you which security rule allowed it. The most valuable line for "why was it allowed?".</li>
<li><b>nat-rule</b> tells you which NAT rule translated it. The most valuable line for "why does the server see this source IP?".</li>
<li><b>ingress and egress interface</b> prove the routing decision.</li>
<li><b>src user</b> is <code>unknown</code> when User-ID has no mapping for the IP. The pan-userid module covers it.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A vendor says "your office comes from two different addresses". You run show session all filter destination with the vendor address, pick two session IDs and compare nat-rule and address/port translation in each. One session used SNAT-Out and the other used a second rule with a pool. Now you know exactly which rule to fix, with evidence.</p></div>

<h3>Clearing sessions</h3>
<p><code>clear session id 9361</code> removes one session. <code>clear session all</code> removes all of them and drops every user connection, so on production use it only in a maintenance window. The next packet of a cleared flow creates a new session and is evaluated against the current rules.</p>
<pre class="out">PA1&gt; clear session id 99999
Session 99999 is not valid</pre>
<p>That message simply means the ID does not exist (anymore). Session IDs are reused over time and change between runs, so always read the ID from the table first instead of typing one from an old ticket.</p>

<div class="warn"><p><b>Common mistake.</b> Clearing all sessions to "fix" something. It breaks every working connection, including voice calls and file transfers, and the problem often comes back because the rule or route was never fixed. Clear one session and prove the cause first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which command shows the NAT rule that translated a flow: show session id, the nat-rule line. Know also that an application shown as incomplete or unknown-tcp is an App-ID signal, not a NAT problem.</p></div>

<div class="scn"><h4>Two offices, one vendor, one blocked</h4><p>A vendor allow-listed 203.0.113.2 but a second branch was still blocked. The engineer filtered sessions on the vendor destination, opened the detail and saw the second branch was translated by a different rule to a different pool address. The vendor had never been told about that pool. The vendor added the address and the ticket closed, without changing any firewall rule.</p><p><b>Lesson:</b> Session detail shows the real translation. Compare working and failing sessions side by side.</p></div>

<div class="iv"><p class="q">"How do you find which security rule and NAT rule a live connection is using?"</p><p>I run show session all with a filter on the source or destination to get the session ID, then show session id for that ID. The rule line gives the security rule and the nat-rule line gives the NAT rule, and the c2s and s2c flows show the translated addresses and the ingress and egress interfaces. I would also mention that I never clear all sessions on production.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show session all lists live sessions: two lines each, original and translated addresses.</li>
<li>Always filter by source, destination, application or rule.</li>
<li>show session id shows the rule, nat-rule, application, flows and interfaces.</li>
<li>Flags NS, ND and NB show source, destination and both NAT.</li>
<li>Clear one session by ID; clearing all drops every user connection.</li>
</ul></div>

`,hi:`

<p><b>Session table hi sach hai.</b> Counters batate hain kya drop hua. Logs batate hain kya khatam hua. Session table batata hai abhi kya zinda hai, us flow ke liye firewall ke exact decision ke saath. Jab user kehta hai "kuch logon ke liye chalta hai, kuch ke liye nahi", to aap sessions padhte ho.</p>

<h3>Analogy: attendance register</h3>
<p>Training class attendance register rakhti hai: abhi kamre mein kaun hai, kaunsi seat, kisne andar aane diya. <code>show session all</code> wahi register hai. <code>show session id</code> ek student ki detailed file hai: kaunsi rule ne admit kiya, kaunsi application use karta hai, naam badla gaya ya nahi (NAT).</p>

<h3>show session all padhna</h3>
<p>Har session do lines leta hai. Pehli line mein ID, application, state, type, flags, original source port aur zone ke saath, protocol number, aur bracket mein translated source hota hai. Doosri line mein original destination port aur zone ke saath, aur translated destination hota hai. Yeh lab ka ek session hai, jo DMZ web server ko DNS allow karne ke baad bana:</p>
<pre class="out">PA1&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
9361         dns            ACTIVE  FLOW NS    10.0.2.10[57160]/dmz/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[53]/untrust  (8.8.8.8[53])</pre>
<p>Aise padho: server 10.0.2.10, zone <b>dmz</b> mein, TCP (protocol 6) se 8.8.8.8 port 53 par gaya, zone <b>untrust</b>. Flag <code>NS</code> ka matlab source NAT: source 203.0.113.2 port 60001 mein translate hua. Application column <code>dns</code> kehta hai, yaani App-ID ne classify kiya, sirf port se nahi.</p>
<table class="cmp"><tr><th>Flag</th><th>Matlab</th></tr>
<tr><td>NS</td><td>Source NAT laga</td></tr>
<tr><td>ND</td><td>Destination NAT laga</td></tr>
<tr><td>NB</td><td>Source aur destination dono NAT</td></tr>
</table>

<h3>Table ko filter karna</h3>
<p>Busy firewall par hazaaron sessions hote hain. Hamesha filter lagao. Lab yeh filters keyword aur value pairs ke roop mein leta hai:</p>
<pre class="code">show session all filter source 10.0.2.10
show session all filter destination 8.8.8.8
show session all filter application dns
show session all filter rule DMZ-Out</pre>
<p>Real firewall par aur bhi filters hote hain (jaise port, ingress interface aur zone). Idea wahi hai: ticket ke us ek user ya server tak narrow karo.</p>

<h3>show session id padhna</h3>
<p>Table se ID lo aur detail maango. Yeh woh lines hain jo pehle padhni hain (output <code>...</code> se trim kiya hai):</p>
<pre class="out">PA1&gt; show session id 9361

Session             9361

	c2s flow:
		source:      10.0.2.10 [dmz]
		dst:         8.8.8.8
		proto:       6
		sport:       57160           dport:      53
		state:       ACTIVE          type:       FLOW
		src user:    unknown
		dst user:    unknown

	s2c flow:
		source:      8.8.8.8 [untrust]
		dst:         203.0.113.2
		proto:       6
		sport:       53              dport:      60001
		state:       ACTIVE          type:       FLOW
	...
	timeout                              : 3600 sec
	application                          : dns
	<span class="hl">rule                                 : DMZ-Out</span>
	address/port translation             : source
	<span class="hl">nat-rule                             : SNAT-Out(vsys1)</span>
	ingress interface                    : ethernet1/3
	egress interface                     : ethernet1/1</pre>
<ul>
<li><b>c2s aur s2c flows</b> dono directions dikhate hain. s2c flow mein destination <i>translated</i> address 203.0.113.2 hai: yahi address internet dekhta hai.</li>
<li><b>rule</b> batata hai kaunsi security rule ne allow kiya. "Allow kyun hua?" ke liye sabse kaam ki line.</li>
<li><b>nat-rule</b> batata hai kaunsi NAT rule ne translate kiya. "Server ko yeh source IP kyun dikh raha?" ke liye sabse kaam ki line.</li>
<li><b>ingress aur egress interface</b> routing decision saabit karte hain.</li>
<li><b>src user</b> tab <code>unknown</code> hota hai jab User-ID ke paas us IP ka mapping nahi. Isko pan-userid module cover karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Vendor kehta hai "aapka office do alag addresses se aata hai". Aap vendor address ke destination filter se show session all chalate ho, do session IDs chunte ho aur har ek mein nat-rule aur address/port translation compare karte ho. Ek session SNAT-Out se bana aur doosra pool waali doosri rule se. Ab aapko evidence ke saath pata hai kaunsi rule theek karni hai.</p></div>

<h3>Sessions clear karna</h3>
<p><code>clear session id 9361</code> ek session hataata hai. <code>clear session all</code> sab hataata hai aur har user connection gira deta hai, isliye production par sirf maintenance window mein. Cleared flow ka agla packet naya session banata hai aur current rules se evaluate hota hai.</p>
<pre class="out">PA1&gt; clear session id 99999
Session 99999 is not valid</pre>
<p>Is message ka matlab bas itna hai ki ID exist nahi karta (ab nahi karta). Session IDs time ke saath reuse hote hain aur runs ke beech badalte hain, isliye purane ticket ki ID type karne ke bajaye hamesha table se ID padho.</p>

<div class="warn"><p><b>Common mistake.</b> Kuch "theek karne" ke liye saare sessions clear kar dena. Isse har chalta connection toot jaata hai, voice calls aur file transfers samet, aur problem aksar wapas aa jaati hai kyunki rule ya route theek hua hi nahi. Ek session clear karo aur pehle wajah saabit karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho kaunsa command translate karne waali NAT rule dikhata hai: show session id, nat-rule line. Yeh bhi yaad rakho ki application incomplete ya unknown-tcp dikhna App-ID ka signal hai, NAT problem nahi.</p></div>

<div class="scn"><h4>Do offices, ek vendor, ek blocked</h4><p>Vendor ne 203.0.113.2 allow-list kiya lekin doosri branch phir bhi blocked thi. Engineer ne vendor destination par sessions filter kiye, detail kholi aur dekha ki doosri branch ko alag rule ne alag pool address mein translate kiya. Vendor ko us pool ke baare mein kabhi bataya hi nahi gaya tha. Vendor ne address add kiya aur ticket band hua, firewall ki koi rule badle bina.</p><p><b>Lesson:</b> Session detail asli translation dikhati hai. Chalte aur fail hote sessions ko side by side compare karo.</p></div>

<div class="iv"><p class="q">"Live connection kaunsi security rule aur NAT rule use kar raha hai, yeh kaise pata karte ho?"</p><p>Source ya destination par filter ke saath show session all chalakar session ID leta hoon, phir us ID ke liye show session id. Rule line security rule deti hai, nat-rule line NAT rule, aur c2s aur s2c flows translated addresses aur ingress aur egress interfaces dikhate hain. Yeh bhi kahunga ki production par saare sessions kabhi clear nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show session all live sessions list karta hai: har ek ki do lines, original aur translated addresses.</li>
<li>Hamesha source, destination, application ya rule se filter karo.</li>
<li>show session id rule, nat-rule, application, flows aur interfaces dikhata hai.</li>
<li>Flags NS, ND aur NB source, destination aur dono NAT dikhate hain.</li>
<li>ID se ek session clear karo; sab clear karna har user connection girata hai.</li>
</ul></div>

`}};export{e as default};