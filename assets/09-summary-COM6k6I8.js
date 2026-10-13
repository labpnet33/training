var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter pulls the module together. Read it the night before an exam or an interview, then go back to any chapter where a line feels unfamiliar. The whole subject fits one sentence: <b>classify the traffic, mark it once at the trust boundary, and let every device after that treat it by the marking</b>.</p>

<h3>The module in eight lines</h3>
<ol>
<li>QoS has three jobs: classify, mark, treat. This module covers the first two.</li>
<li>Traffic types need different things: voice wants low delay, jitter and loss; bulk data tolerates delay but not constant drops.</li>
<li>Markings live in the ToS byte (DSCP, 6 bits; IP precedence, top 3 bits) and in the 802.1Q tag (CoS, 3 bits, Layer 2 only).</li>
<li>MQC has three parts: class-map decides who, policy-map decides what, service-policy decides where and in which direction.</li>
<li>The first matching class wins; class-default catches the rest.</li>
<li>Trust boundary: untrusted ports re-marked, phones conditionally trusted, edge device writes the marking.</li>
<li>CoS does not survive routing; translate CoS to DSCP going in and DSCP to CoS going out.</li>
<li>Verify with show policy-map interface under live traffic, then prove at the far end.</li>
</ol>

<h3>Can-do checklist</h3>
<p>Tick each line honestly. A gap tells you which chapter to reread.</p>
<table class="cmp"><tr><th>I can...</th><th>Chapter</th></tr>
<tr><td>Explain classify, mark and treat, and say where each is applied</td><td>1</td></tr>
<tr><td>Name the needs of voice, video, signalling and bulk traffic with approximate numbers</td><td>2</td></tr>
<tr><td>Convert between AF names and DSCP numbers, and say how CoS 5 maps by default</td><td>3</td></tr>
<tr><td>Write class-maps with match-any, match-all, ACL, DSCP, protocol and not</td><td>4</td></tr>
<tr><td>Write a policy-map with set dscp or set cos and attach it with service-policy</td><td>5</td></tr>
<tr><td>Build a trust boundary on a switch port and a router subinterface</td><td>6</td></tr>
<tr><td>Read show class-map and show policy-map interface and say what each counter means</td><td>7</td></tr>
<tr><td>Find why traffic lands in class-default, one clue at a time</td><td>8</td></tr>
</table>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>EF</td><td>DSCP 46, voice media</td></tr>
<tr><td>AF41, AF31, AF21, AF11</td><td>34, 26, 18, 10 (AFxy = 8x + 2y)</td></tr>
<tr><td>CS3, CS1, CS6</td><td>24, 8, 48</td></tr>
<tr><td>Default</td><td>DSCP 0</td></tr>
<tr><td>CoS range</td><td>0 to 7, only in the 802.1Q tag</td></tr>
<tr><td>Default CoS 5 to DSCP</td><td>40, not 46</td></tr>
<tr><td>Class-map default type</td><td>match-all</td></tr>
<tr><td>Voice RTP ports</td><td>UDP 16384 to 32767</td></tr>
<tr><td>G.711 voice stream</td><td>200 byte packets x 50 per second = 80 kbps</td></tr>
</table>

<h3>Mini glossary</h3>
<ul>
<li><b>Class-map:</b> a named test that decides whether a packet belongs to a class.</li>
<li><b>Policy-map:</b> a list of classes with actions, read from the top.</li>
<li><b>Service-policy:</b> attaches a policy to an interface in the input or output direction.</li>
<li><b>Trust boundary:</b> the point where received markings stop being believed.</li>
<li><b>Re-marking:</b> overwriting a marking with a value the network chose.</li>
<li><b>Class-default:</b> the built-in class for everything unmatched.</li>
<li><b>BA, MF classifier (Junos):</b> classify by marking, classify by header fields.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code">class-map match-any VOICE
 match access-group name VOICE-RTP
policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/1
 service-policy input MARK-IN
<span class="c">!</span>
show class-map
show policy-map interface GigabitEthernet0/1 input
show ip access-lists VOICE-RTP
show mls qos interface FastEthernet0/1
traffic show</pre>

<div class="note"><p><b>Junos note.</b> Quick map for Junos readers: class-map plus set dscp corresponds to a BA classifier or a multifield filter plus a rewrite rule; check with <code>show class-of-service interface</code>, <code>show firewall filter NAME</code> and <code>show class-of-service rewrite-rule</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the order of thinking. Always ask: who sends it, do I trust it, which class catches it, which direction, and what proves it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Watch for options that mix up CoS and DSCP, input and output, match-any and match-all, and for answers that say "show class-map" proves marking.</p></div>

<div class="scn"><h4>Day one at a new branch</h4><p>A new Surat branch opens with 40 PCs and 12 phones on one switch. The checklist for the engineer: put phones and PCs in different VLANs, trust only the phone ports, re-mark PC traffic to 0, mark voice EF and signalling CS3 where needed, attach in the input direction, and prove with counters and a clean test call.</p><p><b>Lesson:</b> the order of work is the same every time.</p></div>
<div class="iv"><p class="q">"Summarise how you would mark traffic in a new network."</p><p>Define classes by need, mark at the trust boundary closest to the source, keep markings consistent across the path, translate CoS and DSCP at the L2 / L3 border, verify with live traffic and counters, and document the plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify, mark once at the edge, treat everywhere by the marking.</li>
<li>Know the numbers: EF 46, AF by 8x + 2y, CS3 24, CoS 5 maps to 40 by default.</li>
<li>First match wins, class-default is last, default class-map type is match-all.</li>
<li>Verify with show policy-map interface under traffic, then prove at the far end.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko ek jagah jodta hai. Exam ya interview se pehli raat ise padho, phir jis chapter ki line anjaan lage us par wapas jao. Poora subject ek vaakya mein aata hai: <b>traffic classify karo, trust boundary par ek baar mark karo, aur uske baad har device ko marking ke hisaab se treat karne do</b>.</p>

<h3>Module aath lines mein</h3>
<ol>
<li>QoS ke teen kaam hain: classify, mark, treat. Yeh module pehle do cover karta hai.</li>
<li>Traffic types ko alag cheezein chahiye: voice ko kam delay, jitter aur loss chahiye; bulk data delay jhel leta hai par lagatar drops nahi.</li>
<li>Markings ToS byte mein hoti hain (DSCP, 6 bit; IP precedence, upar ke 3 bit) aur 802.1Q tag mein (CoS, 3 bit, sirf Layer 2).</li>
<li>MQC ke teen hisse hain: class-map tay karta hai kaun, policy-map tay karta hai kya, service-policy tay karta hai kahan aur kis direction mein.</li>
<li>Pehli matching class jeetti hai; class-default baaki pakadti hai.</li>
<li>Trust boundary: untrusted ports re-mark, phones conditionally trusted, edge device marking likhta hai.</li>
<li>CoS routing se bachta nahi; andar CoS se DSCP aur bahar DSCP se CoS translate karo.</li>
<li>Live traffic ke neeche show policy-map interface se verify karo, phir door ke end par prove karo.</li>
</ol>

<h3>Can-do checklist</h3>
<p>Har line imaandari se tick karo. Jahan gap ho wahi chapter dobara padho.</p>
<table class="cmp"><tr><th>Main kar sakta hoon...</th><th>Chapter</th></tr>
<tr><td>Classify, mark aur treat samjhana, aur har ek kahan lagta hai batana</td><td>1</td></tr>
<tr><td>Voice, video, signalling aur bulk traffic ki zarooratein lagbhag numbers ke saath batana</td><td>2</td></tr>
<tr><td>AF names aur DSCP numbers ke beech convert karna, aur CoS 5 default se kahan map hota hai batana</td><td>3</td></tr>
<tr><td>match-any, match-all, ACL, DSCP, protocol aur not ke saath class-maps likhna</td><td>4</td></tr>
<tr><td>set dscp ya set cos ke saath policy-map likhna aur service-policy se attach karna</td><td>5</td></tr>
<tr><td>Switch port aur router subinterface par trust boundary banana</td><td>6</td></tr>
<tr><td>show class-map aur show policy-map interface padhna aur har counter ka matlab batana</td><td>7</td></tr>
<tr><td>Ek ek clue se dhundhna ki traffic class-default mein kyun jaa raha hai</td><td>8</td></tr>
</table>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>EF</td><td>DSCP 46, voice media</td></tr>
<tr><td>AF41, AF31, AF21, AF11</td><td>34, 26, 18, 10 (AFxy = 8x + 2y)</td></tr>
<tr><td>CS3, CS1, CS6</td><td>24, 8, 48</td></tr>
<tr><td>Default</td><td>DSCP 0</td></tr>
<tr><td>CoS range</td><td>0 se 7, sirf 802.1Q tag mein</td></tr>
<tr><td>Default CoS 5 se DSCP</td><td>40, 46 nahi</td></tr>
<tr><td>Class-map default type</td><td>match-all</td></tr>
<tr><td>Voice RTP ports</td><td>UDP 16384 se 32767</td></tr>
<tr><td>G.711 voice stream</td><td>200 byte packets x 50 per second = 80 kbps</td></tr>
</table>

<h3>Mini glossary</h3>
<ul>
<li><b>Class-map:</b> ek naam wala test jo tay karta hai ki packet class ka hai ya nahi.</li>
<li><b>Policy-map:</b> actions ke saath classes ki list, upar se padhi jaati hai.</li>
<li><b>Service-policy:</b> policy ko interface par input ya output direction mein lagata hai.</li>
<li><b>Trust boundary:</b> woh point jahan mili hui markings par bharosa band hota hai.</li>
<li><b>Re-marking:</b> marking ko us value se overwrite karna jo network ne chuni.</li>
<li><b>Class-default:</b> har unmatched ke liye built-in class.</li>
<li><b>BA, MF classifier (Junos):</b> marking se classify, header fields se classify.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code">class-map match-any VOICE
 match access-group name VOICE-RTP
policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/1
 service-policy input MARK-IN
<span class="c">!</span>
show class-map
show policy-map interface GigabitEthernet0/1 input
show ip access-lists VOICE-RTP
show mls qos interface FastEthernet0/1
traffic show</pre>

<div class="note"><p><b>Junos note.</b> Junos padhne walon ke liye quick map: class-map aur set dscp, BA classifier ya multifield filter aur rewrite rule ke barabar hain; check karo <code>show class-of-service interface</code>, <code>show firewall filter NAME</code> aur <code>show class-of-service rewrite-rule</code> se.</p></div>

<div class="warn"><p><b>Common mistake.</b> Commands rat lena par sochne ka order nahi. Hamesha poochho: kaun bhejta hai, kya main trust karta hoon, kaun si class pakadti hai, kaun si direction, aur saboot kya hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aise options se bacho jo CoS aur DSCP, input aur output, match-any aur match-all ko milate hain, aur aise jawab jo kehte hain "show class-map" marking sabit karta hai.</p></div>

<div class="scn"><h4>Naye branch ka pehla din</h4><p>Surat mein naya branch ek switch par 40 PCs aur 12 phones ke saath khulta hai. Engineer ki checklist: phones aur PCs alag VLANs mein, sirf phone ports trust, PC traffic 0 par re-mark, voice EF aur signalling CS3 jahan chahiye mark, input direction mein attach, aur counters aur saaf test call se prove.</p><p><b>Lesson:</b> kaam ka order har baar wahi rehta hai.</p></div>
<div class="iv"><p class="q">"Naye network mein traffic kaise mark karoge, summary do."</p><p>Zaroorat ke hisaab se classes define karo, source ke sabse paas trust boundary par mark karo, path bhar markings consistent rakho, L2 / L3 border par CoS aur DSCP translate karo, live traffic aur counters se verify karo, aur plan document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify, edge par ek baar mark, har jagah marking se treat.</li>
<li>Numbers jaano: EF 46, AF 8x + 2y se, CS3 24, CoS 5 default se 40 map hota hai.</li>
<li>First match wins, class-default aakhri hai, default class-map type match-all hai.</li>
<li>Traffic ke neeche show policy-map interface se verify karo, phir door ke end par prove karo.</li>
</ul></div>
`}};export{e as default};