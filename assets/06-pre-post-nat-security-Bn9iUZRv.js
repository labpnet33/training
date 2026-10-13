var e={id:`pre-post`,h:{en:`The classic trap: pre-NAT address, post-NAT zone in the security rule`,hi:`Classic trap: security rule mein pre-NAT address, post-NAT zone`},body:{en:`
<p>This chapter is one long worked ticket, because this is the mistake that appears most often in real networks and in exams. A colleague published the DMZ web server on a second public address, 203.0.113.4. The NAT rule is correct, yet customers get timeouts. His security rule looks "obviously right" to him: <b>to dmz, destination 10.0.2.10</b>. He is applying the logic of other firewall brands, where the security rule sees the translated address.</p>
<h3>Step 1: reproduce</h3>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
<span class="hl">curl: (28) Failed to connect to 203.0.113.4 port 80 after 2001 ms: Timeout was reached</span></pre>
<h3>Step 2: is NAT working?</h3>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from untrust to untrust source 8.8.8.8 destination 203.0.113.4 protocol 6 destination-port 80
WEB2-DNAT; index: 2 {
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
<span class="hl">        destination WEB2-PUBLIC;</span>
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10";</span>
        terminal no;
}</pre>
<p>The NAT rule matches and translates to 10.0.2.10. NAT is not the problem. A timeout with a good NAT decision points to the security rulebase.</p>
<h3>Step 3: test security exactly as the firewall sees the packet</h3>
<p>The customer sent to the <b>public</b> address. Test with the zones after NAT (untrust to dmz) and the original destination:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.4 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>No rule matches. Now ask the same question with the private address the colleague wrote in the rule, to understand why the rule exists but does not apply:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 10.0.2.10 protocol 6 destination-port 80
<span class="hl">"WEB2-IN; index: 2" {</span>
        from untrust;
        source any;
        source-region none;
        to dmz;
<span class="hl">        destination WEB-PRIVATE;</span>
        destination-region none;
        category any;
        application/service web-browsing/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>The rule would match a packet addressed to 10.0.2.10, but no customer ever sends a packet to 10.0.2.10. The counter confirms a policy denial:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
Global counters:
Elapsed time since last sampling: 30.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
-----------------------------------------------------------------------------------------------
Total counters shown: 1
-----------------------------------------------------------------------------------------------</pre>
<h3>Step 4: fix and Step 5: prove</h3>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# delete rulebase security rules WEB2-IN destination WEB-PRIVATE
[edit]
admin@NK-PUNE-PA# set rulebase security rules WEB2-IN destination WEB2-PUBLIC
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.4 protocol 6 destination-port 80
<span class="hl">"WEB2-IN; index: 2" {</span>
        from untrust;
        source any;
        source-region none;
        to dmz;
<span class="hl">        destination WEB2-PUBLIC;</span>
        destination-region none;
        category any;
        application/service web-browsing/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; show session all filter source 8.8.8.8
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
<span class="hl">9361         web-browsing   ACTIVE  FLOW ND    8.8.8.8[57160]/untrust/6  (8.8.8.8[57160])</span>
vsys1                                          203.0.113.4[80]/dmz  (10.0.2.10[80])</pre>
<p>The page loads, and the session carries the <b>ND</b> flag with the public destination 203.0.113.4 translated to 10.0.2.10 in zone dmz.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="NAT rule and security rule side by side"><rect x="20" y="20" width="130" height="74" rx="10" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="11">to .4</text><line x1="153" y1="57" x2="173" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="173,57 167,53 167,61" fill="#64748b"/><rect x="176" y="20" width="130" height="74" rx="10" fill="#fde68a"/><text x="241" y="50" text-anchor="middle" class="svg-ink" font-size="13">NAT rule</text><text x="241" y="72" text-anchor="middle" class="svg-muted" font-size="11">untrust>untrust</text><line x1="309" y1="57" x2="329" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="329,57 323,53 323,61" fill="#64748b"/><rect x="332" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="397" y="72" text-anchor="middle" class="svg-muted" font-size="11">untrust>dmz</text><line x1="465" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="485,57 479,53 479,61" fill="#64748b"/><rect x="488" y="20" width="130" height="74" rx="10" fill="#fde68a"/><text x="553" y="50" text-anchor="middle" class="svg-ink" font-size="13">Dest .4</text><text x="553" y="72" text-anchor="middle" class="svg-muted" font-size="11">pre-NAT IP</text></svg><p class="cap">Zones: NAT uses pre-NAT, security uses post-NAT. Address in security: always pre-NAT.</p></div>
<div class="warn"><p><b>Common mistake.</b> Testing only from inside. Internal users reach the server by its private address, so an internal test works with the wrong rule and hides the mistake.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question pattern: "A DNAT rule translates 203.0.113.4 to 10.0.2.10 in zone dmz. Which security rule works?" Answer: from untrust to dmz, destination 203.0.113.4, application web-browsing. Not destination 10.0.2.10, and not to untrust.</p></div>
<div class="scn"><h4>Same mistake, three sites</h4><p>A template copied to three sites contained the private destination in the security rule. Each site had a different outage ticket with a different symptom description, but the test command answered all three the same way in under a minute: the security rule did not match the public address. The template was fixed once and the lesson went into the change checklist: "security rule destination = public address".</p><p><b>Lesson:</b> the test command turns a vague outage into one exact fact.</p></div>
<div class="iv"><p class="q">"A DNAT rule exists and looks right, but external users time out. What do you check?"</p><p>I run test nat-policy-match to confirm the translation, then test security-policy-match from the ingress zone to the post-NAT zone with the original public destination. If it falls to interzone-default, the security rule is probably using the private address or the wrong destination zone. I fix it to the pre-NAT address and post-NAT zone, commit and verify the ND flag in the session.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Security rule: pre-NAT destination address, post-NAT destination zone.</li><li>A good NAT decision plus a timeout points to the security rulebase.</li><li>Test from the outside, with the public address.</li><li><code>flow_policy_deny</code> confirms a policy denial.</li></ul></div>
`,hi:`
<p>Yeh chapter ek lambi worked ticket hai, kyunki yahi galti asli networks aur exams mein sabse zyada milti hai. Ek colleague ne DMZ web server ko doosre public address, 203.0.113.4, par publish kiya. NAT rule sahi hai, phir bhi customers ko timeout milta hai. Use apni security rule "bilkul sahi" lagti hai: <b>to dmz, destination 10.0.2.10</b>. Woh doosre firewall brands ka logic laga raha hai jahan security rule translated address dekhti hai.</p>
<h3>Step 1: reproduce</h3>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
<span class="hl">curl: (28) Failed to connect to 203.0.113.4 port 80 after 2001 ms: Timeout was reached</span></pre>
<h3>Step 2: kya NAT chal raha hai?</h3>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from untrust to untrust source 8.8.8.8 destination 203.0.113.4 protocol 6 destination-port 80
WEB2-DNAT; index: 2 {
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
<span class="hl">        destination WEB2-PUBLIC;</span>
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10";</span>
        terminal no;
}</pre>
<p>NAT rule match hoti hai aur 10.0.2.10 mein translate karti hai. NAT samasya nahi hai. Sahi NAT decision ke saath timeout security rulebase ki taraf ishaara karta hai.</p>
<h3>Step 3: security ko bilkul waise test karo jaise firewall packet dekhta hai</h3>
<p>Customer ne <b>public</b> address par bheja. Test NAT ke baad ke zones (untrust to dmz) aur original destination ke saath karo:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.4 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Koi rule match nahi hoti. Ab wahi sawaal us private address ke saath poochho jo colleague ne rule mein likha, taaki samjho ki rule maujood hai lekin lagu kyun nahi hoti:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 10.0.2.10 protocol 6 destination-port 80
<span class="hl">"WEB2-IN; index: 2" {</span>
        from untrust;
        source any;
        source-region none;
        to dmz;
<span class="hl">        destination WEB-PRIVATE;</span>
        destination-region none;
        category any;
        application/service web-browsing/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Rule 10.0.2.10 par addressed packet se match hoti, lekin koi customer 10.0.2.10 par packet nahi bhejta. Counter policy denial confirm karta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
Global counters:
Elapsed time since last sampling: 30.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
-----------------------------------------------------------------------------------------------
Total counters shown: 1
-----------------------------------------------------------------------------------------------</pre>
<h3>Step 4: fix aur Step 5: prove</h3>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# delete rulebase security rules WEB2-IN destination WEB-PRIVATE
[edit]
admin@NK-PUNE-PA# set rulebase security rules WEB2-IN destination WEB2-PUBLIC
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.4 protocol 6 destination-port 80
<span class="hl">"WEB2-IN; index: 2" {</span>
        from untrust;
        source any;
        source-region none;
        to dmz;
<span class="hl">        destination WEB2-PUBLIC;</span>
        destination-region none;
        category any;
        application/service web-browsing/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; show session all filter source 8.8.8.8
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
<span class="hl">9361         web-browsing   ACTIVE  FLOW ND    8.8.8.8[57160]/untrust/6  (8.8.8.8[57160])</span>
vsys1                                          203.0.113.4[80]/dmz  (10.0.2.10[80])</pre>
<p>Page load hota hai, aur session par <b>ND</b> flag hai, public destination 203.0.113.4 ka translation zone dmz ke 10.0.2.10 mein.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="NAT rule aur security rule saath-saath"><rect x="20" y="20" width="130" height="74" rx="10" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="11">.4 tak</text><line x1="153" y1="57" x2="173" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="173,57 167,53 167,61" fill="#64748b"/><rect x="176" y="20" width="130" height="74" rx="10" fill="#fde68a"/><text x="241" y="50" text-anchor="middle" class="svg-ink" font-size="13">NAT rule</text><text x="241" y="72" text-anchor="middle" class="svg-muted" font-size="11">untrust>untrust</text><line x1="309" y1="57" x2="329" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="329,57 323,53 323,61" fill="#64748b"/><rect x="332" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="397" y="72" text-anchor="middle" class="svg-muted" font-size="11">untrust>dmz</text><line x1="465" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="485,57 479,53 479,61" fill="#64748b"/><rect x="488" y="20" width="130" height="74" rx="10" fill="#fde68a"/><text x="553" y="50" text-anchor="middle" class="svg-ink" font-size="13">Dest .4</text><text x="553" y="72" text-anchor="middle" class="svg-muted" font-size="11">pre-NAT IP</text></svg><p class="cap">Zones: NAT pre-NAT, security post-NAT use karta hai. Security mein address: hamesha pre-NAT.</p></div>
<div class="warn"><p><b>Common mistake.</b> Sirf andar se test karna. Internal users server tak private address se pahunchte hain, isliye internal test galat rule ke saath bhi chal jaata hai aur galti chhupa leta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question pattern: "DNAT rule 203.0.113.4 ko zone dmz ke 10.0.2.10 mein translate karti hai. Kaunsi security rule chalegi?" Jawab: from untrust to dmz, destination 203.0.113.4, application web-browsing. Destination 10.0.2.10 nahi, aur to untrust nahi.</p></div>
<div class="scn"><h4>Teen sites par wahi galti</h4><p>Teen sites par copy hue template ki security rule mein private destination tha. Har site ka outage ticket alag symptom ke saath tha, lekin test command ne teeno ko ek minute ke andar ek hi tarah jawab diya: security rule public address se match nahi hui. Template ek baar theek hua aur change checklist mein sabak jodha gaya: "security rule destination = public address".</p><p><b>Lesson:</b> test command ek dhundhli outage ko ek exact fact bana deta hai.</p></div>
<div class="iv"><p class="q">"DNAT rule maujood aur sahi dikhti hai lekin external users timeout hote hain. Kya check karoge?"</p><p>Main test nat-policy-match se translation confirm karta hoon, phir ingress zone se post-NAT zone tak original public destination ke saath test security-policy-match chalata hoon. Interzone-default par gire to security rule shayad private address ya galat destination zone use kar rahi hai. Use pre-NAT address aur post-NAT zone par theek karta hoon, commit karta hoon aur session mein ND flag verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Security rule: pre-NAT destination address, post-NAT destination zone.</li><li>Sahi NAT decision ke saath timeout security rulebase ki taraf ishaara karta hai.</li><li>Bahar se test karo, public address ke saath.</li><li><code>flow_policy_deny</code> policy denial confirm karta hai.</li></ul></div>
`}};export{e as default};