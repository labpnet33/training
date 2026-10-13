var e={id:`lab-search-and-policy-log`,h:{en:`Labs fa-search and fa-policy-log-ts`,hi:`Labs fa-search aur fa-policy-log-ts`},body:{en:`
<p>A driving test has two parts: you drive a planned route, and then the examiner asks you to find out why the car will not start. These two labs are the same. The first one trains the planned route of a search; the second trains the fault finding when the logs are not there. This chapter gives you the goal, the approach and the output to look for. It does not give you the finished commands, because you learn the search by building it.</p>

<h3>Lab A: fa-search (configuration, about 30 minutes)</h3>
<p><b>Goal.</b> The helpdesk says the user at 10.20.0.10 (PC-MDU in Madurai) tried to start a file-sharing client this morning and the firewall stopped it. All three FortiGates are registered to FAZ-1 and MDU-FGT runs an application control list. You must find the blocked session and report the application, the FortiGate and the destination port.</p>
<p><b>Step 1: reproduce the day.</b> A search needs logs, so create them. On each PC open web sessions to SRV-WEB at 192.0.2.80 with the <code>curl</code> command (twice per PC), and on PC-MDU start the file-sharing client with <code>nk-app BitTorrent 192.0.2.80</code>. The client reports that the traffic stopped after the first packets; that is the firewall working. Give the lab a few seconds, because the logs travel from the FortiGates to FAZ-1.</p>
<p><b>Step 2: the search for the verdict.</b> You know the source address and you know that something was stopped. Remember chapter 3: a verdict lives in a UTM log. You do not know which FortiGate, so use the dash for the device. Read the result for the field that names the application.</p>
<p><b>Step 3: which FortiGate.</b> The answer is in the same log, in <code>devname</code>.</p>
<p><b>Step 4: the traffic log.</b> Now ask the traffic logs of that device for the session where the profile said block. The field for that is not <code>action</code>. Look at your own result for the destination port.</p>

<p><b>What to look for.</b> One line, "1 logs match", for the UTM search. In the traffic log of the same session you will see a surprising pair that you know from chapter 1:</p>
<pre class="out">type="traffic" subtype="forward" level="notice" srcip=10.20.0.10 sessionid=9081
  policyid=1 policyname="LAN-TO-WAN" <span class="hl">action="accept" utmaction="block"</span> ...</pre>

<div class="warn"><p><b>Common wrong turns.</b> Searching traffic logs with <code>action=block</code>: the traffic log says accept, so you get zero. Typing <code>srcip=10.20.0.1</code> without a star. Searching straight after <code>nk-app</code> without waiting. Using ADOM names that do not exist; in this lab the ADOM is <code>root</code>.</p></div>

<h3>Lab B: fa-policy-log-ts (troubleshooting, about 25 minutes)</h3>
<p><b>Goal.</b> HQ-FGT and TRY-FGT are both registered in FAZ-1 and both carry web traffic. Log View shows traffic logs of HQ-FGT but none of TRY-FGT, although the connection and registration are fine. Find the cause, correct it and prove it with a new search.</p>
<p><b>Step 1: confirm the symptom.</b> Generate web sessions from PC-HQ and PC-TRY (twice each) and search the traffic logs of TRY-FGT. You expect a zero. Before you touch anything, check the device table:</p>
<pre class="out">FAZ-1 # diagnose log device
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0         2026-10-12 20:48:07
TRY-FGT         FGVMEV3X688U0000    root      <span class="hl">0        0      0</span>      0         -</pre>
<p><b>Step 2: rule out the chain.</b> Chapter 5 gave you the chain. Check TRY-FGT with <code>diagnose test application miglogd 6</code>:</p>
<pre class="out">TRY-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=realtime data-path=ok
  registration=registered source=192.0.2.13 queued=0 <span class="hl">sent(t/u/e)=0/0/0</span> lost=0</pre>
<p>Connected, registered, realtime, nothing queued and nothing lost. So links 3, 4 and 5 are healthy; nothing is being <i>written</i>. That points to link 1 or 2: the policy or the filter.</p>
<p><b>Step 3: compare, do not guess.</b> You have a working twin (HQ-FGT) and a broken one. Print policy 1 on both with <code>show full-configuration firewall policy 1</code> and compare line by line. The plain <code>show</code> will mislead you, because a default value is not printed. Find the one line that differs.</p>
<p><b>Step 4: fix and prove.</b> Change that setting inside <code>config firewall policy</code>, <code>edit 1</code>, <code>set logtraffic ...</code>, <code>next</code>, <code>end</code>. Choose the value that logs every session; the lab asks for it as a one-word answer. Old sessions are never logged afterwards, so generate new web sessions from PC-TRY and search again. After the fix the device table looks different:</p>
<pre class="out">FAZ-1 # diagnose log device
TRY-FGT         FGVMEV3X688U0000    root      <span class="hl">4        0      1</span>      0         2026-10-12 20:49:47</pre>
<p>The traffic count is no longer zero. The one event log is the record of your own configuration change, a nice reminder that event logs exist.</p>

<div class="eg"><p><b>Worked example of the reasoning.</b> Facts: other site logs, same FortiAnalyzer, same registration. Therefore the cause is local to TRY-FGT. Facts: queue empty, nothing lost, nothing sent. Therefore the logs are not being created. Facts: the policy has no security profile. Therefore a setting that logs only security events creates nothing. Three facts, one cause.</p></div>

<div class="exam"><p><b>Exam traps.</b> A policy with no security profile and logtraffic at its default produces no traffic logs. The default is hidden by show. Connection test results do not say anything about whether logs are written.</p></div>

<div class="scn"><h4>Quiet Trichy</h4><p>During an audit the compliance officer found no traffic logs for the Trichy store for the past month. The FortiAnalyzer was healthy and registration was correct. The Trichy policy had been created from an old template where logging was left at the default, so only security events would have been logged, and there were none.</p><p><b>Lesson:</b> compare a silent device with a working twin before you blame the central server.</p></div>

<div class="iv"><p class="q">"Everything is connected and registered but one site has no traffic logs. How do you prove where the problem is?"</p><p>I read the miglogd counters: nothing queued, nothing lost and nothing sent means the FortiGate writes nothing, so I compare the policy with a working site using show full-configuration and fix the logtraffic setting, then generate new traffic to verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create the traffic first; a search needs logs that exist.</li>
<li>Verdicts are in UTM logs; the traffic log of the same session says accept with utmaction block.</li>
<li>The device table and miglogd counters separate writing, sending and storing problems.</li>
<li>Compare with a working twin using show full-configuration.</li>
<li>A logging fix applies only to new sessions, so generate new traffic to prove it.</li>
</ul></div>
`,hi:`
<p>Driving test ke do hisse hote hain: aap planned route chalate ho, aur phir examiner poochta hai ki gaadi start kyun nahi ho rahi. Ye do labs bhi aise hi hain. Pehla lab search ka planned route sikhata hai; doosra tab fault finding sikhata hai jab logs hain hi nahi. Ye chapter aapko goal, approach aur dekhne wala output deta hai. Ye tayyar commands nahi deta, kyunki search banakar hi seekhte hain.</p>

<h3>Lab A: fa-search (configuration, lagbhag 30 minutes)</h3>
<p><b>Goal.</b> Helpdesk kehta hai ki 10.20.0.10 wale user (Madurai ka PC-MDU) ne aaj subah file-sharing client start karne ki koshish ki aur firewall ne use roka. Teeno FortiGates FAZ-1 mein registered hain aur MDU-FGT par application control list chalti hai. Aapko blocked session dhoondhna hai aur application, FortiGate aur destination port report karna hai.</p>
<p><b>Step 1: din reproduce karo.</b> Search ko logs chahiye, to banao. Har PC se SRV-WEB 192.0.2.80 par <code>curl</code> command se web sessions kholo (har PC par do baar), aur PC-MDU par <code>nk-app BitTorrent 192.0.2.80</code> se file-sharing client start karo. Client report karta hai ki pehle kuch packets ke baad traffic ruk gaya; wahi firewall ka kaam hai. Lab ko kuch seconds do, kyunki logs FortiGates se FAZ-1 tak safar karte hain.</p>
<p><b>Step 2: verdict ka search.</b> Aapko source address pata hai aur ye pata hai ki kuch roka gaya. Chapter 3 yaad karo: verdict UTM log mein hota hai. Kaun sa FortiGate ye pata nahi, to device ke liye dash use karo. Result mein wo field padho jo application ka naam batata hai.</p>
<p><b>Step 3: kaun sa FortiGate.</b> Jawab usi log mein <code>devname</code> mein hai.</p>
<p><b>Step 4: traffic log.</b> Ab us device ke traffic logs se wo session maango jahan profile ne block kaha. Uska field <code>action</code> nahi hai. Apne result mein destination port dekho.</p>

<p><b>Kya dekhna hai.</b> UTM search ke liye ek line, "1 logs match". Usi session ke traffic log mein ek hairaan karne wali jodi dikhegi jo aap chapter 1 se jaante ho:</p>
<pre class="out">type="traffic" subtype="forward" level="notice" srcip=10.20.0.10 sessionid=9081
  policyid=1 policyname="LAN-TO-WAN" <span class="hl">action="accept" utmaction="block"</span> ...</pre>

<div class="warn"><p><b>Common wrong turns.</b> Traffic logs mein <code>action=block</code> search karna: traffic log accept kehta hai, to zero milta hai. Star ke bina <code>srcip=10.20.0.1</code> likhna. <code>nk-app</code> ke turant baad bina wait kiye search karna. Aise ADOM names use karna jo exist nahi karte; is lab mein ADOM <code>root</code> hai.</p></div>

<h3>Lab B: fa-policy-log-ts (troubleshooting, lagbhag 25 minutes)</h3>
<p><b>Goal.</b> HQ-FGT aur TRY-FGT dono FAZ-1 mein registered hain aur dono web traffic carry karte hain. Log View HQ-FGT ke traffic logs dikhata hai par TRY-FGT ke ek bhi nahi, jabki connection aur registration theek hain. Cause dhoondho, theek karo aur naye search se prove karo.</p>
<p><b>Step 1: symptom confirm karo.</b> PC-HQ aur PC-TRY se web sessions banao (har ek se do baar) aur TRY-FGT ke traffic logs search karo. Zero expected hai. Kuch chhedne se pehle device table dekho:</p>
<pre class="out">FAZ-1 # diagnose log device
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0         2026-10-12 20:48:07
TRY-FGT         FGVMEV3X688U0000    root      <span class="hl">0        0      0</span>      0         -</pre>
<p><b>Step 2: chain ko rule out karo.</b> Chapter 5 ne chain di thi. TRY-FGT ko <code>diagnose test application miglogd 6</code> se check karo:</p>
<pre class="out">TRY-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=realtime data-path=ok
  registration=registered source=192.0.2.13 queued=0 <span class="hl">sent(t/u/e)=0/0/0</span> lost=0</pre>
<p>Connected, registered, realtime, kuch queued nahi aur kuch lost nahi. To links 3, 4 aur 5 healthy hain; kuch <i>likha</i> hi nahi ja raha. Ye link 1 ya 2 ki taraf ishara karta hai: policy ya filter.</p>
<p><b>Step 3: compare karo, guess nahi.</b> Aapke paas ek working twin (HQ-FGT) hai aur ek broken. Dono par <code>show full-configuration firewall policy 1</code> print karo aur line by line compare karo. Plain <code>show</code> aapko bhatkayega, kyunki default value print nahi hoti. Wo ek line dhoondho jo alag hai.</p>
<p><b>Step 4: fix aur prove.</b> Us setting ko <code>config firewall policy</code>, <code>edit 1</code>, <code>set logtraffic ...</code>, <code>next</code>, <code>end</code> ke andar badlo. Wo value chuno jo har session log kare; lab ise ek-word answer ki tarah maangta hai. Purane sessions baad mein kabhi log nahi hote, to PC-TRY se naye web sessions banao aur dobara search karo. Fix ke baad device table alag dikhti hai:</p>
<pre class="out">FAZ-1 # diagnose log device
TRY-FGT         FGVMEV3X688U0000    root      <span class="hl">4        0      1</span>      0         2026-10-12 20:49:47</pre>
<p>Traffic count ab zero nahi hai. Ek event log aapke apne configuration change ka record hai, yaad dilata hai ki event logs bhi hote hain.</p>

<div class="eg"><p><b>Reasoning ka worked example.</b> Facts: doosri site ke logs aate hain, same FortiAnalyzer, same registration. Isliye cause TRY-FGT mein local hai. Facts: queue khaali, kuch lost nahi, kuch sent nahi. Isliye logs ban hi nahi rahe. Facts: policy mein security profile nahi hai. Isliye wo setting jo sirf security events log karti hai kuch nahi banati. Teen facts, ek cause.</p></div>

<div class="exam"><p><b>Exam traps.</b> Jis policy mein security profile nahi hai aur logtraffic default par hai wo traffic logs nahi banati. Default show se chhup jata hai. Connection test results nahi batate ki logs likhe ja rahe hain ya nahi.</p></div>

<div class="scn"><h4>Khamosh Trichy</h4><p>Audit ke dauran compliance officer ko pichhle mahine ka Trichy store ka koi traffic log nahi mila. FortiAnalyzer healthy tha aur registration sahi tha. Trichy policy ek purane template se bani thi jahan logging default par chhodi gayi thi, to sirf security events log hote, aur wo the hi nahi.</p><p><b>Lesson:</b> central server ko blame karne se pehle silent device ko working twin se compare karo.</p></div>

<div class="iv"><p class="q">"Sab connected aur registered hai par ek site ke traffic logs nahi hain. Problem kahan hai ye kaise prove karte ho?"</p><p>Main miglogd counters padhta hoon: kuch queued nahi, kuch lost nahi aur kuch sent nahi matlab FortiGate kuch likh hi nahi raha, to policy ko working site se show full-configuration se compare karta hoon aur logtraffic setting fix karta hoon, phir naya traffic bana ke verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle traffic banao; search ko aise logs chahiye jo exist karte hon.</li>
<li>Verdicts UTM logs mein hain; same session ka traffic log accept aur utmaction block kehta hai.</li>
<li>Device table aur miglogd counters writing, sending aur storing problems ko alag karte hain.</li>
<li>Working twin se show full-configuration ke saath compare karo.</li>
<li>Logging fix sirf naye sessions par lagta hai, isliye prove karne ke liye naya traffic banao.</li>
</ul></div>
`}};export{e as default};