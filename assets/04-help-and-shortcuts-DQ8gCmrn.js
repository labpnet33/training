var e={id:`help`,h:{en:`Help, shortcuts and IOS error messages`,hi:`Help, shortcuts aur IOS error messages`},body:{en:`
<p>Nobody remembers every IOS command, not even engineers with twenty years of experience. What they remember is how to ask the device. Think of IOS as a patient shop assistant: you can say "what do you have?" at any moment, and it lists your options. That assistant is the question mark.</p>

<h3>Context-sensitive help with ?</h3>
<p>The <code>?</code> key shows what you can type <b>at this point, in this mode</b>. There are two forms, and the space before the <code>?</code> is what makes the difference:</p>
<table class="cmp"><tr><th>You type</th><th>IOS shows</th><th>Called</th></tr>
<tr><td><code>?</code></td><td>Every command available in this mode</td><td>Command help</td></tr>
<tr><td><code>cl?</code> (no space)</td><td>Every word that <b>starts with</b> cl: <code>clear  clock</code></td><td>Word help</td></tr>
<tr><td><code>clock ?</code> (with space)</td><td>The <b>next</b> keyword or argument after clock</td><td>Command syntax help</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Word help versus syntax help">
<rect x="20" y="20" width="280" height="110" rx="10" fill="#bae6fd"/><text x="160" y="50" text-anchor="middle" class="svg-accent" font-size="14">R1# cl?</text><text x="160" y="78" text-anchor="middle" class="svg-ink" font-size="13">clear  clock</text><text x="160" y="108" text-anchor="middle" class="svg-muted" font-size="12">no space: which words start with cl?</text>
<rect x="340" y="20" width="280" height="110" rx="10" fill="#bbf7d0"/><text x="480" y="50" text-anchor="middle" class="svg-accent" font-size="14">R1# clock ?</text><text x="480" y="78" text-anchor="middle" class="svg-ink" font-size="13">set  Set the time and date</text><text x="480" y="108" text-anchor="middle" class="svg-muted" font-size="12">space: what comes next?</text>
</svg><p class="cap">One space changes the question you are asking.</p></div>
<pre class="out">R1# cl?
clear  clock

R1# clock ?
  set  Set the time and date

R1# show ip interface brief ?
  |  Output modifiers
  <span class="hl">&lt;cr&gt;</span></pre>
<p><b>&lt;cr&gt;</b> means "carriage return": the command is complete and you can press Enter. Arguments in angle brackets such as <code>&lt;1-15&gt;</code> or <code>A.B.C.D</code> tell you the type of value expected.</p>

<h3>Tab completion and abbreviations</h3>
<p>Type the first letters of a keyword and press <b>Tab</b>: IOS completes the word if only one keyword matches. Even without Tab, IOS accepts any <b>unique abbreviation</b>. That is why engineers type:</p>
<pre class="code">en                  <span class="c">! enable</span>
conf t              <span class="c">! configure terminal</span>
sh ip int br        <span class="c">! show ip interface brief</span>
int g0/0            <span class="c">! interface GigabitEthernet0/0</span>
sh run              <span class="c">! show running-config</span>
wr                  <span class="c">! write memory (saves the configuration)</span></pre>
<p>The abbreviation must be unique in the current mode. <code>c</code> at <code>R1#</code> could be <code>clear</code>, <code>clock</code>, <code>configure</code>, <code>connect</code> or <code>copy</code>, so IOS refuses it as ambiguous.</p>

<h3>Command history</h3>
<p>IOS remembers your recent commands. Press the <b>up arrow</b> (or <b>Ctrl-P</b>) to recall the previous one and the <b>down arrow</b> (or <b>Ctrl-N</b>) to move forward again. <code>show history</code> lists the recent commands of this session; the buffer holds 10 commands by default and <code>terminal history size 50</code> enlarges it for the current session. Recalling and editing a long command is much faster, and safer, than retyping it.</p>

<h3>Keyboard shortcuts worth knowing</h3>
<table class="cmp"><tr><th>Keys</th><th>Effect</th></tr>
<tr><td><b>Tab</b></td><td>Complete the current keyword</td></tr>
<tr><td><b>Ctrl-A</b> / <b>Ctrl-E</b></td><td>Jump to the start / end of the line</td></tr>
<tr><td><b>Ctrl-Z</b></td><td>Leave configuration mode (same as <code>end</code>)</td></tr>
<tr><td><b>Ctrl-C</b></td><td>Abort the current input; in config mode it returns to privileged EXEC</td></tr>
<tr><td><b>Ctrl-Shift-6</b></td><td>Break sequence: interrupt a running ping, traceroute or name lookup</td></tr>
<tr><td><b>Space</b> / <b>Enter</b> / <b>q</b> at --More--</td><td>Next page / next line / stop the output</td></tr>
</table>
<p>Long output pauses at <code>--More--</code>. <code>terminal length 0</code> turns paging off for the session, which is handy before copying a whole configuration.</p>

<h3>The three error messages</h3>
<pre class="out">R1# confgure terminal
      ^
<span class="hl">% Invalid input detected at '^' marker.</span>

R1# clock set
<span class="hl">% Incomplete command.</span>

R1# c
<span class="hl">% Ambiguous command:  "c"</span></pre>
<ul>
<li><b>% Invalid input detected at '^' marker</b>: the word under the caret is wrong (a typo, a keyword that does not exist, or the wrong mode). Look exactly where the caret points.</li>
<li><b>% Incomplete command</b>: the start is right but required arguments are missing. Recall the line and add <code> ?</code> to see what comes next.</li>
<li><b>% Ambiguous command</b>: the abbreviation matches more than one keyword. Type more letters.</li>
</ul>

<h3>The "Translating..." freeze and no ip domain-lookup</h3>
<p>If you mistype a command at an EXEC prompt, for example <code>shw</code>, IOS assumes the unknown word is a host name you want to Telnet to and tries to resolve it with DNS:</p>
<pre class="out">R1# shw
<span class="hl">Translating "shw"...domain server (255.255.255.255)</span>
% Unknown command or computer name, or unable to find computer address</pre>
<p>With no DNS server configured it broadcasts and waits several seconds. Press Ctrl-Shift-6 to cut the wait short, and prevent it permanently in lab devices with <code>no ip domain-lookup</code> in global configuration, which you will do in lab 2.</p>

<div class="eg"><p><b>Worked example.</b> You need to set the clock but do not remember the format. <code>clock ?</code> shows <code>set</code>. <code>clock set ?</code> shows <code>hh:mm:ss</code>. <code>clock set 10:30:00 ?</code> shows the day, then month, then year. Four question marks later you typed <code>clock set 10:30:00 29 September 2026</code> correctly on the first attempt, without a manual.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>show?</code> when you wanted <code>show ?</code> (you get word help instead of the options). Pressing Ctrl-C to stop a ping (use Ctrl-Shift-6). Retyping a 60-character command instead of using the up arrow. Ignoring where the caret points and re-typing the same typo.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>?</code> directly after letters lists matching keywords; <code>?</code> after a space lists the next argument. &lt;cr&gt; means the command is complete. The history buffer default is 10 commands. Ctrl-Shift-6 is the break sequence. Know the exact wording of Invalid, Incomplete and Ambiguous.</p></div>

<div class="scn"><h4>The five-minute ping</h4><p>A trainee pinged an unreachable address with a repeat count of 10000 while troubleshooting and the console was locked, printing dots. She pressed Ctrl-C again and again with no effect and was about to pull the power. A colleague pressed Ctrl-Shift-6 and the ping stopped instantly, returning the prompt.</p><p><b>Lesson:</b> on IOS the break sequence is Ctrl-Shift-6, not Ctrl-C. Learn it before you need it.</p></div>

<div class="iv"><p class="q">"You cannot remember the syntax of a command on a Cisco device. What do you do?"</p><p>Strong answer: use context-sensitive help. <code>?</code> lists commands in the current mode, <code>abc?</code> lists keywords starting with abc, and <code>command ?</code> shows the next argument, with &lt;cr&gt; meaning the command is complete. Use Tab to complete, the up arrow to recall and edit, and read the caret in "% Invalid input" to see exactly which word was wrong.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>?</code> is always available: without a space it completes a word, with a space it shows the next argument.</li>
<li>Tab completes keywords; any unique abbreviation works (<code>sh ip int br</code>).</li>
<li>Up arrow / Ctrl-P recalls commands; <code>show history</code> lists them (10 by default).</li>
<li>Ctrl-Z leaves config mode; Ctrl-Shift-6 interrupts ping, traceroute and DNS lookups.</li>
<li>Invalid = wrong word (see the caret), Incomplete = missing argument, Ambiguous = abbreviation too short.</li>
</ul></div>
`,hi:`
<p>Koi bhi har IOS command yaad nahi rakhta, bees saal ke experience wale engineers bhi nahi. Unhe yeh yaad rehta hai ki device se kaise poochna hai. IOS ko ek dhairya wala shop assistant samjho: aap kabhi bhi pooch sakte ho "aapke paas kya hai?", aur woh aapke options ki list de deta hai. Woh assistant question mark hai.</p>

<h3>? ke saath context-sensitive help</h3>
<p><code>?</code> key dikhati hai ki aap <b>is point par, is mode mein</b> kya type kar sakte ho. Iske do form hain, aur <code>?</code> se pehle ka space hi farak paida karta hai:</p>
<table class="cmp"><tr><th>Aap type karte ho</th><th>IOS dikhata hai</th><th>Naam</th></tr>
<tr><td><code>?</code></td><td>Is mode mein available har command</td><td>Command help</td></tr>
<tr><td><code>cl?</code> (bina space)</td><td>Har woh word jo cl se <b>shuru hota hai</b>: <code>clear  clock</code></td><td>Word help</td></tr>
<tr><td><code>clock ?</code> (space ke saath)</td><td>clock ke baad ka <b>agla</b> keyword ya argument</td><td>Command syntax help</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Word help aur syntax help">
<rect x="20" y="20" width="280" height="110" rx="10" fill="#bae6fd"/><text x="160" y="50" text-anchor="middle" class="svg-accent" font-size="14">R1# cl?</text><text x="160" y="78" text-anchor="middle" class="svg-ink" font-size="13">clear  clock</text><text x="160" y="108" text-anchor="middle" class="svg-muted" font-size="12">bina space: kaunse words cl se shuru?</text>
<rect x="340" y="20" width="280" height="110" rx="10" fill="#bbf7d0"/><text x="480" y="50" text-anchor="middle" class="svg-accent" font-size="14">R1# clock ?</text><text x="480" y="78" text-anchor="middle" class="svg-ink" font-size="13">set  Set the time and date</text><text x="480" y="108" text-anchor="middle" class="svg-muted" font-size="12">space: aage kya aata hai?</text>
</svg><p class="cap">Ek space poochhe gaye sawaal ko badal deta hai.</p></div>
<pre class="out">R1# cl?
clear  clock

R1# clock ?
  set  Set the time and date

R1# show ip interface brief ?
  |  Output modifiers
  <span class="hl">&lt;cr&gt;</span></pre>
<p><b>&lt;cr&gt;</b> ka matlab "carriage return": command poori hai aur aap Enter daba sakte ho. Angle brackets wale arguments jaise <code>&lt;1-15&gt;</code> ya <code>A.B.C.D</code> batate hain ki kis type ki value chahiye.</p>

<h3>Tab completion aur abbreviations</h3>
<p>Keyword ke pehle kuch letters type karo aur <b>Tab</b> dabao: agar sirf ek keyword match karta hai to IOS word poora kar deta hai. Tab ke bina bhi IOS koi bhi <b>unique abbreviation</b> accept karta hai. Isiliye engineers aise type karte hain:</p>
<pre class="code">en                  <span class="c">! enable</span>
conf t              <span class="c">! configure terminal</span>
sh ip int br        <span class="c">! show ip interface brief</span>
int g0/0            <span class="c">! interface GigabitEthernet0/0</span>
sh run              <span class="c">! show running-config</span>
wr                  <span class="c">! write memory (configuration save karta hai)</span></pre>
<p>Abbreviation current mode mein unique honi chahiye. <code>R1#</code> par <code>c</code> ka matlab <code>clear</code>, <code>clock</code>, <code>configure</code>, <code>connect</code> ya <code>copy</code> ho sakta hai, isliye IOS ise ambiguous bol kar mana kar deta hai.</p>

<h3>Command history</h3>
<p>IOS aapki recent commands yaad rakhta hai. Pichli command wapas laane ke liye <b>up arrow</b> (ya <b>Ctrl-P</b>) dabao aur aage jaane ke liye <b>down arrow</b> (ya <b>Ctrl-N</b>). <code>show history</code> is session ki recent commands dikhata hai; buffer default mein 10 commands rakhta hai aur <code>terminal history size 50</code> current session ke liye ise bada kar deta hai. Lambi command ko recall karke edit karna dobara type karne se kahin tez, aur safe, hai.</p>

<h3>Kaam ke keyboard shortcuts</h3>
<table class="cmp"><tr><th>Keys</th><th>Effect</th></tr>
<tr><td><b>Tab</b></td><td>Current keyword complete karo</td></tr>
<tr><td><b>Ctrl-A</b> / <b>Ctrl-E</b></td><td>Line ke start / end par jao</td></tr>
<tr><td><b>Ctrl-Z</b></td><td>Configuration mode chhodo (<code>end</code> jaisa)</td></tr>
<tr><td><b>Ctrl-C</b></td><td>Current input abort karo; config mode mein privileged EXEC par le aata hai</td></tr>
<tr><td><b>Ctrl-Shift-6</b></td><td>Break sequence: chalti ping, traceroute ya name lookup rok do</td></tr>
<tr><td>--More-- par <b>Space</b> / <b>Enter</b> / <b>q</b></td><td>Agla page / agli line / output band karo</td></tr>
</table>
<p>Lamba output <code>--More--</code> par rukta hai. <code>terminal length 0</code> session ke liye paging band kar deta hai, jo poori configuration copy karne se pehle kaam aata hai.</p>

<h3>Teen error messages</h3>
<pre class="out">R1# confgure terminal
      ^
<span class="hl">% Invalid input detected at '^' marker.</span>

R1# clock set
<span class="hl">% Incomplete command.</span>

R1# c
<span class="hl">% Ambiguous command:  "c"</span></pre>
<ul>
<li><b>% Invalid input detected at '^' marker</b>: caret ke neeche wala word galat hai (typo, aisa keyword jo exist hi nahi karta, ya galat mode). Bilkul wahan dekho jahan caret point karta hai.</li>
<li><b>% Incomplete command</b>: shuruaat sahi hai lekin zaroori arguments missing hain. Line recall karo aur <code> ?</code> jodo taaki dikhe aage kya aata hai.</li>
<li><b>% Ambiguous command</b>: abbreviation ek se zyada keywords se match karti hai. Aur letters type karo.</li>
</ul>

<h3>"Translating..." freeze aur no ip domain-lookup</h3>
<p>Agar aap EXEC prompt par command galat type karte ho, jaise <code>shw</code>, to IOS maan leta hai ki anjaan word ek host name hai jahan aap Telnet karna chahte ho aur use DNS se resolve karne ki koshish karta hai:</p>
<pre class="out">R1# shw
<span class="hl">Translating "shw"...domain server (255.255.255.255)</span>
% Unknown command or computer name, or unable to find computer address</pre>
<p>Koi DNS server configure na ho to yeh broadcast karta hai aur kai second wait karta hai. Wait chhota karne ke liye Ctrl-Shift-6 dabao, aur lab devices mein global configuration mein <code>no ip domain-lookup</code> se ise hamesha ke liye roko, jo aap lab 2 mein karoge.</p>

<div class="eg"><p><b>Worked example.</b> Aapko clock set karni hai lekin format yaad nahi. <code>clock ?</code> <code>set</code> dikhata hai. <code>clock set ?</code> <code>hh:mm:ss</code> dikhata hai. <code>clock set 10:30:00 ?</code> din, phir mahina, phir saal dikhata hai. Chaar question marks ke baad aapne <code>clock set 10:30:00 29 September 2026</code> pehli hi koshish mein sahi type kar diya, bina manual ke.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>show ?</code> chahiye tha lekin <code>show?</code> type kar diya (options ki jagah word help milti hai). Ping rokne ke liye Ctrl-C dabana (Ctrl-Shift-6 use karo). Up arrow use karne ki jagah 60 character ki command dobara type karna. Caret kahan point kar raha hai yeh ignore karke wahi typo dobara type karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Letters ke turant baad <code>?</code> matching keywords dikhata hai; space ke baad <code>?</code> agla argument dikhata hai. &lt;cr&gt; ka matlab command poori hai. History buffer ka default 10 commands hai. Ctrl-Shift-6 break sequence hai. Invalid, Incomplete aur Ambiguous ki exact wording yaad rakho.</p></div>

<div class="scn"><h4>Paanch minute ki ping</h4><p>Ek trainee ne troubleshooting karte hue ek unreachable address ko 10000 repeat count ke saath ping kiya aur console lock ho gaya, dots print karta raha. Usne baar baar Ctrl-C dabaya par kuch nahi hua aur woh power nikaalne wali thi. Ek colleague ne Ctrl-Shift-6 dabaya aur ping turant ruk gayi, prompt wapas aa gaya.</p><p><b>Seekh:</b> IOS par break sequence Ctrl-Shift-6 hai, Ctrl-C nahi. Zaroorat padne se pehle ise seekh lo.</p></div>

<div class="iv"><p class="q">"Cisco device par aapko kisi command ka syntax yaad nahi. Aap kya karoge?"</p><p>Strong answer: context-sensitive help use karunga. <code>?</code> current mode ki commands dikhata hai, <code>abc?</code> abc se shuru hone wale keywords dikhata hai, aur <code>command ?</code> agla argument dikhata hai, jahan &lt;cr&gt; ka matlab command poori hai. Complete karne ke liye Tab, recall aur edit ke liye up arrow, aur "% Invalid input" mein caret padh kar dekhunga ki exactly kaunsa word galat tha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>?</code> hamesha available hai: bina space word complete karta hai, space ke saath agla argument dikhata hai.</li>
<li>Tab keywords complete karta hai; koi bhi unique abbreviation chalti hai (<code>sh ip int br</code>).</li>
<li>Up arrow / Ctrl-P commands recall karta hai; <code>show history</code> unhe list karta hai (default 10).</li>
<li>Ctrl-Z config mode chhodta hai; Ctrl-Shift-6 ping, traceroute aur DNS lookups rokta hai.</li>
<li>Invalid = galat word (caret dekho), Incomplete = argument missing, Ambiguous = abbreviation bahut chhoti.</li>
</ul></div>
`}};export{e as default};