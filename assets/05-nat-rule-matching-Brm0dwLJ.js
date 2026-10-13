var e={id:`rule-matching`,h:{en:`NAT rule matching, order and what a rule can and cannot do`,hi:`NAT rule matching, order aur rule kya kar sakti hai aur kya nahi`},body:{en:`
<p>Like security rules, NAT rules are read from the top and the first match wins. Unlike security rules, a NAT rule has <b>no action</b> such as allow or deny: it only describes a translation. That makes ordering important in a different way. A broad source NAT rule above a specific static NAT rule will translate the host with the wrong address, because the broad rule matches first.</p>
<table class="cmp"><tr><th>NAT rule field</th><th>Matches on</th><th>Note</th></tr><tr><td><code>from</code> / <code>to</code></td><td>ingress zone and <b>pre-NAT</b> egress zone</td><td>to-zone is where the original destination routes</td></tr><tr><td><code>source</code> / <code>destination</code></td><td>original addresses</td><td>address objects or any</td></tr><tr><td><code>service</code></td><td>original protocol and port</td><td><code>any</code> or a service object</td></tr><tr><td><code>to-interface</code></td><td>optional egress interface match</td><td>useful with several ISPs</td></tr><tr><td>translation</td><td>source translation and/or destination translation</td><td>the only "action"</td></tr></table>
<h3>Reading the NAT rulebase</h3>
<p>After the web server was published, the lab holds two NAT rules. <code>show running nat-policy</code> lists them with an index; the rule at index 1 is looked at first:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
<span class="hl">"SNAT-Out; index: 1" {</span>
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}

<span class="hl">"WEB-DNAT; index: 2" {</span>
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-PUBLIC;
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10";</span>
        terminal no;
}</pre>
<h3>A specific rule must sit above a general one</h3>
<p>Suppose one PC (10.0.1.10) must leave with its own public address 203.0.113.5 while everyone else uses the interface address. Create a static rule for that PC, a pool-less one-to-one source translation, and place it <b>above</b> the general rule. We also add a second destination NAT rule that publishes the same server on another public address and translates the port to 8080. These were accepted and committed in the simulator (we did not generate traffic for them):</p>
<pre class="out">admin@NK-PUNE-PA# set rulebase nat rules WEB-ALT-8080 from untrust to untrust source any destination WEB-ALT service service-h&#116;tp destination-translation translated-address WEB-PRIVATE translated-port 8080
[edit]
<span class="hl">admin@NK-PUNE-PA# set rulebase nat rules PC-STATIC from trust to untrust source PC-ONE destination any service any source-translation static-ip translated-address PC-ONE-PUB</span>
[edit]
admin@NK-PUNE-PA# move rulebase nat rules PC-STATIC before SNAT-Out
[edit]
admin@NK-PUNE-PA# commit
Commit job 5 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully

[edit]
admin@NK-PUNE-PA&gt; show running nat-policy
<span class="hl">"PC-STATIC; index: 1" {</span>
        nat-type ipv4;
        from trust;
        source PC-ONE;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: 203.0.113.5 (static-ip)";</span>
        terminal no;
}

<span class="hl">"SNAT-Out; index: 2" {</span>
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";
        terminal no;
}

<span class="hl">"WEB-DNAT; index: 3" {</span>
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-PUBLIC;
        service service-h&#116;tp;
        translate-to "dst: 10.0.2.10";
        terminal no;
}

<span class="hl">"WEB-ALT-8080; index: 4" {</span>
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-ALT;
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10:8080";</span>
        terminal no;
}</pre>
<p>Now ask the NAT engine about two different LAN hosts. The first matches the static rule at index 1. The second falls through to the general rule at index 2:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">PC-STATIC; index: 1 {</span>
        translate-to "src: 203.0.113.5 (static-ip)";
admin@NK-PUNE-PA&gt; test nat-policy-match from trust to untrust source 10.0.1.77 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">SNAT-Out; index: 2 {</span>
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</pre>
<p>The order is what separates the two outcomes. If the static rule had been placed below <code>SNAT-Out</code>, <code>10.0.1.10</code> would have matched <code>SNAT-Out</code> first and never used 203.0.113.5.</p>
<div class="note"><p><b>No-NAT.</b> To exempt traffic from translation (for example between two private sites over a VPN), real PAN-OS uses a NAT rule with the source translation set to <code>None</code> placed above the general rule. This is a reference description; it is not exercised in the simulator labs.</p></div>
<div class="warn"><p><b>Common mistake.</b> Adding a specific NAT rule at the bottom. It will never be reached for traffic that the general rule already matches.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT rules have no allow or deny. Order matters; the first match wins. And destination NAT matching uses the <b>original</b> destination address and the <b>pre-NAT</b> zone.</p></div>
<div class="scn"><h4>The CEO's laptop on the wrong address</h4><p>A partner allowed only 203.0.113.5 to reach their portal. The CEO's laptop kept arriving from the firewall's interface address and was blocked. A static NAT rule existed but had been added at the bottom of the NAT rulebase. Moving it above the general rule fixed it, and <code>test nat-policy-match</code> for that source now showed the static translation.</p><p><b>Lesson:</b> a specific NAT rule must be above the general one, same as in security policy.</p></div>
<div class="iv"><p class="q">"Which NAT rule is applied when several match?"</p><p>The first rule from the top that matches ingress zone, pre-NAT egress zone, addresses and service. Therefore specific rules (static, destination NAT, no-NAT) go above general source NAT. I check with <code>test nat-policy-match</code> and read the index of the winning rule.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>First NAT rule that matches wins; place specific rules above general ones.</li><li>A NAT rule has no allow or deny action.</li><li><code>test nat-policy-match</code> returns the rule and index.</li><li>To-zone in a NAT rule is the pre-NAT egress zone.</li></ul></div>
`,hi:`
<p>Security rules ki tarah NAT rules bhi upar se padhi jaati hain aur pehli match jeetti hai. Security rules ke ulat NAT rule mein allow ya deny jaisa <b>action</b> nahi hota: woh sirf translation batati hai. Isliye ordering alag tarah se zaroori hai. Specific static NAT rule ke upar broad source NAT rule host ko galat address se translate kar degi, kyunki broad rule pehle match hoti hai.</p>
<table class="cmp"><tr><th>NAT rule field</th><th>Kispar match</th><th>Note</th></tr><tr><td><code>from</code> / <code>to</code></td><td>ingress zone aur <b>pre-NAT</b> egress zone</td><td>to-zone woh hai jahan original destination route hota hai</td></tr><tr><td><code>source</code> / <code>destination</code></td><td>original addresses</td><td>address objects or any</td></tr><tr><td><code>service</code></td><td>original protocol aur port</td><td><code>any</code> ya service object</td></tr><tr><td><code>to-interface</code></td><td>optional egress interface match</td><td>kai ISPs hon to kaam ka</td></tr><tr><td>translation</td><td>source translation aur/ya destination translation</td><td>ek hi "action"</td></tr></table>
<h3>NAT rulebase padhna</h3>
<p>Web server publish hone ke baad lab mein do NAT rules hain. <code>show running nat-policy</code> unhe index ke saath list karta hai; index 1 wali rule pehle dekhi jaati hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
<span class="hl">"SNAT-Out; index: 1" {</span>
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}

<span class="hl">"WEB-DNAT; index: 2" {</span>
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-PUBLIC;
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10";</span>
        terminal no;
}</pre>
<h3>Specific rule general ke upar honi chahiye</h3>
<p>Maan lo ek PC (10.0.1.10) ko apne public address 203.0.113.5 se bahar jaana hai jabki baaki sab interface address use karte hain. Us PC ke liye static rule banao, pool ke bina ek-se-ek source translation, aur use general rule ke <b>upar</b> rakho. Ek doosri destination NAT rule bhi jodte hain jo wahi server doosre public address par publish karti hai aur port ko 8080 mein translate karti hai. Yeh simulator mein accept aur commit hui (inke liye traffic generate nahi kiya):</p>
<pre class="out">admin@NK-PUNE-PA# set rulebase nat rules WEB-ALT-8080 from untrust to untrust source any destination WEB-ALT service service-h&#116;tp destination-translation translated-address WEB-PRIVATE translated-port 8080
[edit]
<span class="hl">admin@NK-PUNE-PA# set rulebase nat rules PC-STATIC from trust to untrust source PC-ONE destination any service any source-translation static-ip translated-address PC-ONE-PUB</span>
[edit]
admin@NK-PUNE-PA# move rulebase nat rules PC-STATIC before SNAT-Out
[edit]
admin@NK-PUNE-PA# commit
Commit job 5 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully

[edit]
admin@NK-PUNE-PA&gt; show running nat-policy
<span class="hl">"PC-STATIC; index: 1" {</span>
        nat-type ipv4;
        from trust;
        source PC-ONE;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: 203.0.113.5 (static-ip)";</span>
        terminal no;
}

<span class="hl">"SNAT-Out; index: 2" {</span>
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";
        terminal no;
}

<span class="hl">"WEB-DNAT; index: 3" {</span>
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-PUBLIC;
        service service-h&#116;tp;
        translate-to "dst: 10.0.2.10";
        terminal no;
}

<span class="hl">"WEB-ALT-8080; index: 4" {</span>
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-ALT;
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10:8080";</span>
        terminal no;
}</pre>
<p>Ab NAT engine se do alag LAN hosts ke baare mein poochho. Pehla index 1 ki static rule se match hota hai. Doosra index 2 ki general rule par gir jaata hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">PC-STATIC; index: 1 {</span>
        translate-to "src: 203.0.113.5 (static-ip)";
admin@NK-PUNE-PA&gt; test nat-policy-match from trust to untrust source 10.0.1.77 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">SNAT-Out; index: 2 {</span>
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</pre>
<p>Order hi dono outcomes ko alag karta hai. Static rule <code>SNAT-Out</code> ke neeche hoti to <code>10.0.1.10</code> pehle <code>SNAT-Out</code> se match hota aur 203.0.113.5 kabhi use nahi karta.</p>
<div class="note"><p><b>No-NAT.</b> Traffic ko translation se alag rakhna ho (jaise VPN par do private sites ke beech), asli PAN-OS mein general rule ke upar ek NAT rule hoti hai jisme source translation <code>None</code> hota hai. Yeh reference description hai; simulator labs mein iska abhyas nahi hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Specific NAT rule ko bottom par jodna. General rule jo traffic pehle hi match kar leti hai uske liye woh kabhi nahi pahunchi jaati.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT rules mein allow ya deny nahi hota. Order matter karta hai; pehli match jeetti hai. Aur destination NAT matching <b>original</b> destination address aur <b>pre-NAT</b> zone use karta hai.</p></div>
<div class="scn"><h4>CEO ka laptop galat address par</h4><p>Ek partner ne apne portal ke liye sirf 203.0.113.5 allow kiya tha. CEO ka laptop firewall ke interface address se aata raha aur block hua. Static NAT rule thi lekin NAT rulebase ke bottom par jodi gayi thi. Use general rule ke upar move karne se fix hua, aur us source ke liye <code>test nat-policy-match</code> ne ab static translation dikhaya.</p><p><b>Lesson:</b> Specific NAT rule general ke upar honi chahiye, security policy ki tarah.</p></div>
<div class="iv"><p class="q">"Kai NAT rules match hon to kaunsi lagu hoti hai?"</p><p>Upar se pehli rule jo ingress zone, pre-NAT egress zone, addresses aur service se match kare. Isliye specific rules (static, destination NAT, no-NAT) general source NAT ke upar rakhte hain. Main <code>test nat-policy-match</code> se check karta hoon aur jeetne wali rule ka index padhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Jo pehli NAT rule match kare wahi jeetti hai; specific rules general ke upar rakho.</li><li>NAT rule mein allow ya deny action nahi hota.</li><li><code>test nat-policy-match</code> rule aur index return karta hai.</li><li>NAT rule ka to-zone pre-NAT egress zone hota hai.</li></ul></div>
`}};export{e as default};