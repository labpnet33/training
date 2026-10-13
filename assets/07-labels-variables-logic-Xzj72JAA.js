var e={id:`labels-variables-logic`,h:{en:`Action labels, variables and logic`,hi:`Action labels, variables aur logic`},body:{en:`
<p>Think of a library that shelves books by their spine label, read as text from left to right. "Chapter 10" ends up between "Chapter 1" and "Chapter 2", because the librarian compares the first character, then the second, and never looks at the number as a whole. EEM orders action labels the same way. Get that wrong and your applet runs "no shutdown" before "enable".</p>

<h3>How action labels are ordered</h3>
<p>Every action has a <b>label</b>, the word right after <code>action</code>. EEM sorts labels in <b>ascending alphanumeric (text) order</b>, character by character, and runs them in that order. The order in which you typed them does not matter.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Label sort">
<rect x="40" y="20" width="220" height="180" rx="8" fill="#e2e8f0"/><text x="150" y="44" text-anchor="middle" class="svg-ink" font-size="14">As you typed</text>
<text x="150" y="72" text-anchor="middle" class="svg-muted" font-size="13">1   syslog</text><text x="150" y="96" text-anchor="middle" class="svg-muted" font-size="13">2   enable</text><text x="150" y="120" text-anchor="middle" class="svg-muted" font-size="13">3   conf t</text><text x="150" y="144" text-anchor="middle" class="svg-muted" font-size="13">…9  interface</text><text x="150" y="168" text-anchor="middle" class="svg-muted" font-size="13">10  no shutdown</text>
<rect x="380" y="20" width="220" height="180" rx="8" fill="#fed7aa"/><text x="490" y="44" text-anchor="middle" class="svg-ink" font-size="14">As EEM runs</text>
<text x="490" y="72" text-anchor="middle" class="svg-muted" font-size="13">1   syslog</text><text x="490" y="96" text-anchor="middle" class="svg-accent" font-size="13">10  no shutdown</text><text x="490" y="120" text-anchor="middle" class="svg-muted" font-size="13">2   enable</text><text x="490" y="144" text-anchor="middle" class="svg-muted" font-size="13">3   conf t</text><text x="490" y="168" text-anchor="middle" class="svg-muted" font-size="13">…9  interface</text>
<line x1="260" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">text sort</text>
</svg><p class="cap">"10" sorts before "2" because the first character 1 is smaller than 2.</p></div>

<div class="eg"><p><b>Worked example.</b> Sort these labels the way EEM does: <code>2.0, 10.0, 1.0, 1.5, 1.10, 1.9</code>.</p>
<ul>
<li>Compare the first character: everything starting with "1" comes before "2".</li>
<li>Among the "1" labels, the second character is either "." or "0"; a dot sorts before a digit, so <code>1.0 1.10 1.5 1.9</code> come before <code>10.0</code>.</li>
<li>Among <code>1.0 1.10 1.5 1.9</code>, compare the third character: 0, 1, 5, 9.</li>
</ul>
<p>Result: <b>1.0, 1.10, 1.5, 1.9, 10.0, 2.0</b>. Yes, 1.10 runs before 1.5 and 1.9.</p></div>

<p>Safe numbering schemes:</p>
<ul>
<li><b>Single-digit decimals</b>: 1.0, 2.0 … 9.0, with room to insert 1.5 or 2.1 later (never 1.10).</li>
<li><b>Zero-padded integers</b>: 010, 020, 030 … 990, with room for 015 or 025.</li>
</ul>
<p>After every edit, read <code>show running-config | section event manager</code> or <code>show event manager policy registered</code>, which list the actions in the order they will run.</p>

<h3>Variables</h3>
<p>Variables are referenced with a dollar sign and their name, for example <code>$count</code>. There are three sources:</p>
<table class="cmp"><tr><th>Kind</th><th>Created by</th><th>Examples</th></tr>
<tr><td>Built-in</td><td>the event or an action</td><td>_syslog_msg, _cli_result, _cli_msg, _regexp_result, _event_type_string, _info_routername, _exit_status</td></tr>
<tr><td>Environment</td><td><code>event manager environment NAME VALUE</code></td><td>_backup_if, _noc_mail, _maint</td></tr>
<tr><td>Local</td><td><code>action … set</code>, <code>regexp</code>, <code>increment</code></td><td>intf, count, match</td></tr></table>
<pre class="code"> action 1.0 set count 0
 action 2.0 increment count
 action 3.0 syslog msg "count is now $count"</pre>

<h3>regexp: pulling data out of text</h3>
<p><code>action LABEL regexp "PATTERN" "INPUT" MATCH SUB1 SUB2</code> tests INPUT against PATTERN. It sets the built-in _regexp_result to 1 on a match and 0 otherwise, stores the whole match in MATCH and each bracketed group in SUB1, SUB2 and so on.</p>

<h3>if, else and end</h3>
<p>Conditions compare two values with <code>eq ne gt ge lt le</code>. Every <code>if</code> block closes with an <code>end</code> action. Loops (<code>while</code>, <code>foreach</code>) close the same way, and <code>exit</code> stops the applet early.</p>
<pre class="code">event manager applet LINK-EVIDENCE
 event syslog pattern "LINEPROTO-5-UPDOWN.*changed state to down"
 action 010 regexp "Interface ([^,]+)," "$_syslog_msg" match intf
 action 020 if $_regexp_result eq "1"
 action 030  cli command "enable"
 action 040  cli command "show interfaces $intf | append flash:linkdown.txt"
 action 050  syslog msg "Evidence saved for $intf"
 action 060 end</pre>
<p>For the message <code>...Interface GigabitEthernet0/2, changed state to down</code>, the group <code>([^,]+)</code> ("one or more characters that are not a comma") captures <code>GigabitEthernet0/2</code> into <code>intf</code>, so one applet serves every interface.</p>

<h4>A maintenance switch for the lab applet</h4>
<pre class="code">event manager environment _maint no
event manager applet UPLINK-DOWN
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"
 action 0.5 if $_maint eq "yes"
 action 0.6  exit
 action 0.7 end
 action 1.0 syslog priority critical msg "Primary circuit down - enabling backup Gi0/1"
 ... actions 2.0 to 6.0 as before</pre>
<p>Before planned work, set <code>event manager environment _maint yes</code>; the applet still runs but exits at 0.6. Note that 0.5, 0.6 and 0.7 sort before 1.0 correctly.</p>

<div class="warn"><p><b>Common mistake.</b> Forgetting the <code>end</code> action after an <code>if</code>. Every following action then belongs to the if block, so the applet silently does nothing when the condition is false. Indent the actions inside a block by one space as a visual check.</p></div>

<div class="exam"><p><b>Exam trap.</b> Given labels 1, 2, 10 the order is <b>1, 10, 2</b>. Given 1.0, 2.0, 10.0 the order is <b>1.0, 10.0, 2.0</b>. Questions that show a broken applet very often hide a two-digit label.</p></div>

<div class="scn"><h4>Action 10 ran too early</h4><p>A working UPLINK-DOWN applet in Hyderabad used labels 1 to 9. Months later someone appended <code>action 10 cli command "write memory"</code> and <code>action 11 mail …</code>. At the next outage the log showed the mail attempt and a "write memory" failure right after action 1, before <code>enable</code>, and the backup came up but the change was never saved. <code>show event manager policy registered</code> listed the order as 1, 10, 11, 2, 3… The team renumbered everything to 010 through 110.</p><p><b>Lesson:</b> labels are text. Choose a scheme with fixed width from day one.</p></div>

<div class="iv"><p class="q">"What is the classic gotcha with EEM action labels?"</p><p>Strong answer: labels are sorted as strings, not numbers, so 10 runs before 2 and 1.10 before 1.5. I use fixed-width labels such as 010, 020 or single-digit decimals, leave gaps for inserts, and confirm the run order with <code>show event manager policy registered</code>. Then mention variables: built-ins like _syslog_msg and _cli_result, environment variables, and regexp with _regexp_result for parsing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Labels sort as text: 1, 10, 2 and 1.0, 1.10, 1.5, 10.0, 2.0.</li>
<li>Use fixed-width labels (010, 020…) or 1.0 to 9.0 with single-digit inserts.</li>
<li>Variables: built-in (_syslog_msg, _cli_result, _regexp_result), environment, and local (set, regexp, increment).</li>
<li><code>regexp</code> sets _regexp_result and captures groups into named variables.</li>
<li>Every if, while and foreach needs an <code>end</code>; <code>exit</code> stops the applet.</li>
</ul></div>
`,hi:`
<p>Ek library socho jo books ko unke spine label se rakhti hai, baayein se daayein text ki tarah padh kar. "Chapter 10" "Chapter 1" aur "Chapter 2" ke beech pahunch jaata hai, kyunki librarian pehla character compare karta hai, phir doosra, aur number ko poora kabhi nahi dekhta. EEM action labels ko bhi isi tarah order karta hai. Ise galat samjhe to aapka applet "enable" se pehle "no shutdown" chalayega.</p>

<h3>Action labels kaise order hote hain</h3>
<p>Har action ka ek <b>label</b> hota hai, <code>action</code> ke theek baad wala shabd. EEM labels ko <b>ascending alphanumeric (text) order</b> mein, character by character, sort karta hai aur usi order mein chalata hai. Aapne unhe kis order mein type kiya, isse farak nahi padta.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Label sort">
<rect x="40" y="20" width="220" height="180" rx="8" fill="#e2e8f0"/><text x="150" y="44" text-anchor="middle" class="svg-ink" font-size="14">Jaise type kiya</text>
<text x="150" y="72" text-anchor="middle" class="svg-muted" font-size="13">1   syslog</text><text x="150" y="96" text-anchor="middle" class="svg-muted" font-size="13">2   enable</text><text x="150" y="120" text-anchor="middle" class="svg-muted" font-size="13">3   conf t</text><text x="150" y="144" text-anchor="middle" class="svg-muted" font-size="13">…9  interface</text><text x="150" y="168" text-anchor="middle" class="svg-muted" font-size="13">10  no shutdown</text>
<rect x="380" y="20" width="220" height="180" rx="8" fill="#fed7aa"/><text x="490" y="44" text-anchor="middle" class="svg-ink" font-size="14">Jaise EEM chalata hai</text>
<text x="490" y="72" text-anchor="middle" class="svg-muted" font-size="13">1   syslog</text><text x="490" y="96" text-anchor="middle" class="svg-accent" font-size="13">10  no shutdown</text><text x="490" y="120" text-anchor="middle" class="svg-muted" font-size="13">2   enable</text><text x="490" y="144" text-anchor="middle" class="svg-muted" font-size="13">3   conf t</text><text x="490" y="168" text-anchor="middle" class="svg-muted" font-size="13">…9  interface</text>
<line x1="260" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">text sort</text>
</svg><p class="cap">"10" "2" se pehle sort hota hai kyunki pehla character 1, 2 se chhota hai.</p></div>

<div class="eg"><p><b>Worked example.</b> In labels ko EEM ki tarah sort karo: <code>2.0, 10.0, 1.0, 1.5, 1.10, 1.9</code>.</p>
<ul>
<li>Pehla character compare karo: "1" se shuru hone wala sab kuch "2" se pehle aata hai.</li>
<li>"1" wale labels mein doosra character ya to "." hai ya "0"; dot digit se pehle sort hota hai, isliye <code>1.0 1.10 1.5 1.9</code> <code>10.0</code> se pehle aate hain.</li>
<li><code>1.0 1.10 1.5 1.9</code> mein teesra character compare karo: 0, 1, 5, 9.</li>
</ul>
<p>Result: <b>1.0, 1.10, 1.5, 1.9, 10.0, 2.0</b>. Haan, 1.10 1.5 aur 1.9 se pehle chalta hai.</p></div>

<p>Safe numbering schemes:</p>
<ul>
<li><b>Single-digit decimals</b>: 1.0, 2.0 … 9.0, baad mein 1.5 ya 2.1 daalne ki jagah ke saath (kabhi 1.10 nahi).</li>
<li><b>Zero-padded integers</b>: 010, 020, 030 … 990, 015 ya 025 ki jagah ke saath.</li>
</ul>
<p>Har edit ke baad <code>show running-config | section event manager</code> ya <code>show event manager policy registered</code> padho, jo actions ko usi order mein dikhate hain jismein woh chalenge.</p>

<h3>Variables</h3>
<p>Variables ko dollar sign aur unke naam se refer kiya jaata hai, jaise <code>$count</code>. Teen sources hain:</p>
<table class="cmp"><tr><th>Kind</th><th>Kaun banata hai</th><th>Examples</th></tr>
<tr><td>Built-in</td><td>event ya action</td><td>_syslog_msg, _cli_result, _cli_msg, _regexp_result, _event_type_string, _info_routername, _exit_status</td></tr>
<tr><td>Environment</td><td><code>event manager environment NAME VALUE</code></td><td>_backup_if, _noc_mail, _maint</td></tr>
<tr><td>Local</td><td><code>action … set</code>, <code>regexp</code>, <code>increment</code></td><td>intf, count, match</td></tr></table>
<pre class="code"> action 1.0 set count 0
 action 2.0 increment count
 action 3.0 syslog msg "count is now $count"</pre>

<h3>regexp: text se data nikaalna</h3>
<p><code>action LABEL regexp "PATTERN" "INPUT" MATCH SUB1 SUB2</code> INPUT ko PATTERN se test karta hai. Match par yeh built-in _regexp_result ko 1 set karta hai, warna 0, poora match MATCH mein aur har bracket wala group SUB1, SUB2 wagairah mein store karta hai.</p>

<h3>if, else aur end</h3>
<p>Conditions do values ko <code>eq ne gt ge lt le</code> se compare karti hain. Har <code>if</code> block ek <code>end</code> action se band hota hai. Loops (<code>while</code>, <code>foreach</code>) bhi isi tarah band hote hain, aur <code>exit</code> applet ko jaldi rok deta hai.</p>
<pre class="code">event manager applet LINK-EVIDENCE
 event syslog pattern "LINEPROTO-5-UPDOWN.*changed state to down"
 action 010 regexp "Interface ([^,]+)," "$_syslog_msg" match intf
 action 020 if $_regexp_result eq "1"
 action 030  cli command "enable"
 action 040  cli command "show interfaces $intf | append flash:linkdown.txt"
 action 050  syslog msg "Evidence saved for $intf"
 action 060 end</pre>
<p>Message <code>...Interface GigabitEthernet0/2, changed state to down</code> ke liye group <code>([^,]+)</code> ("ek ya zyada characters jo comma nahi hain") <code>GigabitEthernet0/2</code> ko <code>intf</code> mein capture karta hai, isliye ek applet har interface ke kaam aata hai.</p>

<h4>Lab applet ke liye maintenance switch</h4>
<pre class="code">event manager environment _maint no
event manager applet UPLINK-DOWN
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"
 action 0.5 if $_maint eq "yes"
 action 0.6  exit
 action 0.7 end
 action 1.0 syslog priority critical msg "Primary circuit down - enabling backup Gi0/1"
 ... actions 2.0 se 6.0 pehle jaise</pre>
<p>Planned kaam se pehle <code>event manager environment _maint yes</code> set karo; applet phir bhi chalta hai par 0.6 par exit ho jaata hai. Dhyan do ki 0.5, 0.6 aur 0.7 sahi tarah 1.0 se pehle sort hote hain.</p>

<div class="warn"><p><b>Common galti.</b> <code>if</code> ke baad <code>end</code> action bhoolna. Tab uske baad ke saare actions if block ka hissa ban jaate hain, isliye condition false hone par applet chupchaap kuch nahi karta. Block ke andar ke actions ko ek space se indent karo, visual check ki tarah.</p></div>

<div class="exam"><p><b>Exam trap.</b> Labels 1, 2, 10 diye hon to order <b>1, 10, 2</b> hai. 1.0, 2.0, 10.0 diye hon to order <b>1.0, 10.0, 2.0</b> hai. Toota applet dikhane wale questions aksar ek do-digit label chhupate hain.</p></div>

<div class="scn"><h4>Action 10 bahut jaldi chala</h4><p>Hyderabad mein ek kaam karta UPLINK-DOWN applet labels 1 se 9 use karta tha. Mahinon baad kisi ne <code>action 10 cli command "write memory"</code> aur <code>action 11 mail …</code> jod diye. Agle outage mein log ne mail attempt aur action 1 ke theek baad, <code>enable</code> se pehle, "write memory" failure dikhaya, aur backup up to hua par change kabhi save nahi hua. <code>show event manager policy registered</code> ne order 1, 10, 11, 2, 3… dikhaya. Team ne sab kuch 010 se 110 tak renumber kiya.</p><p><b>Seekh:</b> labels text hain. Pehle din se fixed width wala scheme chuno.</p></div>

<div class="iv"><p class="q">"EEM action labels ka classic gotcha kya hai?"</p><p>Strong answer: labels strings ki tarah sort hote hain, numbers ki tarah nahi, isliye 10 2 se pehle aur 1.10 1.5 se pehle chalta hai. Main 010, 020 jaise fixed-width labels ya single-digit decimals use karta hoon, inserts ke liye gaps chhodta hoon, aur <code>show event manager policy registered</code> se run order confirm karta hoon. Phir variables bolo: _syslog_msg aur _cli_result jaise built-ins, environment variables, aur parsing ke liye _regexp_result ke saath regexp.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Labels text ki tarah sort hote hain: 1, 10, 2 aur 1.0, 1.10, 1.5, 10.0, 2.0.</li>
<li>Fixed-width labels (010, 020…) ya single-digit inserts ke saath 1.0 se 9.0 use karo.</li>
<li>Variables: built-in (_syslog_msg, _cli_result, _regexp_result), environment, aur local (set, regexp, increment).</li>
<li><code>regexp</code> _regexp_result set karta hai aur groups ko named variables mein capture karta hai.</li>
<li>Har if, while aur foreach ko <code>end</code> chahiye; <code>exit</code> applet rokta hai.</li>
</ul></div>
`}};export{e as default};