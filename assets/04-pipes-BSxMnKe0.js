var e={id:`pipes`,h:{en:`Pipes: build answers one small step at a time`,hi:`Pipes: jawab ek chhote step mein ek baar banao`},body:{en:`
<p><b>The idea of this chapter:</b> the pipe <code>|</code> connects two commands so that the output of the first becomes the input of the second. This is the central idea of the Unix philosophy: <b>small tools that each do one job well, joined together</b>. Once you master it, you solve problems by building a pipeline one stage at a time and checking the result after each stage.</p>

<h3>The three streams</h3>
<p>Every command has three channels, like three pipes attached to it:</p>
<ul>
<li><b>stdin</b> (standard input, channel 0): where it reads data from. By default your keyboard, or a file you name.</li>
<li><b>stdout</b> (standard output, channel 1): where its normal results go. By default your screen.</li>
<li><b>stderr</b> (standard error, channel 2): where its error messages go. Also your screen by default, but it is a separate channel.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="stdin stdout stderr and a pipe">
<rect x="20" y="40" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="14">command 1</text><text x="85" y="86" text-anchor="middle" class="svg-muted" font-size="11">grep ...</text>
<rect x="260" y="40" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="66" text-anchor="middle" class="svg-ink" font-size="14">command 2</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="11">wc -l</text>
<rect x="500" y="20" width="120" height="40" rx="10" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">your screen</text>
<line x1="150" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="3"/><text x="205" y="62" text-anchor="middle" class="svg-accent" font-size="13">stdout | stdin</text>
<line x1="390" y1="60" x2="500" y2="45" stroke="#64748b" stroke-width="2"/><text x="445" y="42" text-anchor="middle" class="svg-muted" font-size="11">stdout</text>
<path d="M85 100 Q85 150 560 150 Q560 100 560 60" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="11">stderr goes straight to the screen, not through the pipe</text>
</svg><p class="cap">The pipe joins stdout of one command to stdin of the next; stderr is separate.</p></div>

<h3>A first pipe</h3>
<pre class="out">netadmin@nms01:~$ ls /var/log | wc -l
5
netadmin@nms01:~$ ls /var/log | grep log
auth.log
dpkg.log
kern.log
syslog</pre>
<p><code>ls /var/log</code> would normally print five names on the screen. With <code>| wc -l</code> they are fed to <code>wc</code> instead, which counts the lines: five. With <code>| grep log</code> they are filtered. Notice that <code>syslog</code> matched too, because it contains the letters "log". The commands in a pipeline run <b>at the same time</b>: the second starts working as soon as the first produces anything.</p>
<p>Many commands read from a file name <i>or</i> from a pipe. These two lines do the same thing; the second is shorter and is preferred:</p>
<pre class="out">netadmin@nms01:~$ cat devices.csv | grep Pune
PUN-CORE-R1,10.10.0.1,Pune
netadmin@nms01:~$ grep Pune devices.csv
PUN-CORE-R1,10.10.0.1,Pune</pre>

<h3>Build a pipeline in stages</h3>
<p>The question: <b>"Which router had the most line-protocol drops?"</b> Never type the whole pipeline at once. Add one stage, run it, look at the output, and only then add the next. Here is the real simulator output at each stage.</p>
<p><b>Stage 1.</b> Keep only interface up/down messages, then only the "down" ones. Count them to check the idea:</p>
<pre class="out">netadmin@nms01:~$ grep LINEPROTO /var/log/remote/routers.log | grep "state to down" | wc -l
11</pre>
<p>Eleven drops. (Why <code>LINEPROTO</code> first? Because one <code>%LINK-3-UPDOWN</code> line also contains "state to down" but is a different message type. We want line-protocol events only.)</p>
<p><b>Stage 2.</b> Instead of counting, extract the device address. Field 4 of each line is the source IP, so <code>awk '{print $4}'</code> prints it (awk is explained in chapter 7):</p>
<pre class="out">netadmin@nms01:~$ grep LINEPROTO /var/log/remote/routers.log | grep "state to down" | awk '{print $4}'
10.20.0.1
10.20.0.1
10.10.0.1
10.20.0.1
10.40.3.1
10.20.0.1
10.20.0.1
10.20.0.1
10.40.3.1
10.20.0.1
10.20.0.1</pre>
<p><b>Stage 3.</b> Sort so that equal addresses sit together, then <code>uniq -c</code> collapses neighbours and counts them (chapter 6):</p>
<pre class="out">netadmin@nms01:~$ ... | awk '{print $4}' | sort | uniq -c
      1 10.10.0.1
      8 10.20.0.1
      2 10.40.3.1</pre>
<p><b>Stage 4.</b> Sort again, numerically and reversed, so the biggest count is on top:</p>
<pre class="out">netadmin@nms01:~$ ... | sort | uniq -c | sort -rn
      8 10.20.0.1
      2 10.40.3.1
      1 10.10.0.1
netadmin@nms01:~$ ... | sort | uniq -c | sort -rn | head -n 1
      8 10.20.0.1</pre>
<p>The answer is <b>10.20.0.1, eight times</b>. The stage <code>sort | uniq -c | sort -rn</code> is a pattern you will reuse constantly: a "top-N counter". It works for IP addresses, user names, interface names, error codes: anything that appears once per line.</p>

<h3>Pipes carry stdout only</h3>
<pre class="out">netadmin@nms01:~$ ls /nonexistent | wc -l
ls: cannot access '/nonexistent': No such file or directory
0</pre>
<p>The error message was written to stderr, so it went to the screen and not into the pipe, and <code>wc</code> counted zero lines. If you wanted errors in the pipe you would redirect stderr first (next chapter). When the second command's input is empty, always ask: did the first one fail?</p>

<h3>Other useful pipe partners</h3>
<ul>
<li><code>| head -n 20</code> or <code>| tail -n 20</code>: show only the top or end of a long result.</li>
<li><code>| less</code>: page through a long result (on a real server).</li>
<li><code>| tee file</code>: write the data to a file <i>and</i> pass it on (next chapter).</li>
<li><code>| xargs cmd</code>: turn input lines into arguments of another command. For example <code>grep -l "10.40.9.1" *.cfg | xargs ls -l</code> (a reference command; not run in the simulator).</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing a long pipeline in one go and not knowing which stage is wrong. Build and test stage by stage. (2) Using <code>uniq</code> without <code>sort</code>: <code>uniq</code> only collapses <i>neighbouring</i> equal lines. (3) Piping into a command that does not read stdin, such as <code>ls</code> or <code>cp</code>; for those use <code>xargs</code>. (4) Forgetting that an empty result may mean the first command failed, not that nothing was found. (5) Using <code>cat file | grep ...</code> out of habit: it works but wastes a process; use <code>grep ... file</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The pipe connects <b>stdout</b> to <b>stdin</b>; it does not carry stderr. The usual top-N idiom is <code>sort | uniq -c | sort -rn</code>, and the first <code>sort</code> is mandatory because <code>uniq</code> works only on adjacent lines.</p></div>

<div class="scn"><h4>The noisiest router in thirty seconds</h4><p>A manager asked at 9 a.m., "Which router is the worst offender this morning?" The engineer built the pipeline in front of him: first <code>grep</code>, then <code>awk</code> to take the IP, then the counter. At each stage he showed the output so the manager could follow. The final line said <code>8 10.20.0.1</code>. The manager asked for the host name, and the engineer added one more lookup in <code>devices.csv</code>: BLR-EDGE-R2.</p><p><b>Lesson:</b> build pipelines stage by stage; you can explain each step and you will rarely get it wrong.</p></div>

<div class="iv"><p class="q">"What does the pipe do, and why do you need sort before uniq -c?"</p><p>The pipe connects the standard output of one command to the standard input of the next, so small tools can be combined. <code>uniq</code> only collapses adjacent identical lines, so the input must be sorted first, otherwise the same value appears several times in the counts. Then <code>sort -rn</code> ranks the counts, biggest first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every command has stdin, stdout and stderr; the pipe joins stdout to the next stdin.</li>
<li>Build pipelines in stages and check the output after each one.</li>
<li>The top-N counter is <code>sort | uniq -c | sort -rn | head</code>.</li>
<li>stderr does not travel through a pipe.</li>
<li>Prefer <code>grep x file</code> to <code>cat file | grep x</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> pipe <code>|</code> do commands ko jodta hai taaki pehle ka output doosre ka input ban jaaye. Yeh Unix philosophy ka central idea hai: <b>chhote tools jo har ek ek kaam achhe se karte hain, aur jude hue</b>. Ise seekhne ke baad aap ek pipeline ko ek-ek stage mein banakar aur har stage ke baad result check karke problems solve karte ho.</p>

<h3>Teen streams</h3>
<p>Har command ke teen channels hote hain, jaise uske saath teen pipes lagi hon:</p>
<ul>
<li><b>stdin</b> (standard input, channel 0): jahan se woh data padhta hai. Default mein aapka keyboard, ya jo file aap batao.</li>
<li><b>stdout</b> (standard output, channel 1): jahan uske normal results jaate hain. Default mein aapki screen.</li>
<li><b>stderr</b> (standard error, channel 2): jahan uske error messages jaate hain. Default mein yeh bhi screen par, par yeh alag channel hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="stdin stdout stderr aur pipe">
<rect x="20" y="40" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="14">command 1</text><text x="85" y="86" text-anchor="middle" class="svg-muted" font-size="11">grep ...</text>
<rect x="260" y="40" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="66" text-anchor="middle" class="svg-ink" font-size="14">command 2</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="11">wc -l</text>
<rect x="500" y="20" width="120" height="40" rx="10" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">aapki screen</text>
<line x1="150" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="3"/><text x="205" y="62" text-anchor="middle" class="svg-accent" font-size="13">stdout | stdin</text>
<line x1="390" y1="60" x2="500" y2="45" stroke="#64748b" stroke-width="2"/><text x="445" y="42" text-anchor="middle" class="svg-muted" font-size="11">stdout</text>
<path d="M85 100 Q85 150 560 150 Q560 100 560 60" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="11">stderr seedha screen par jaata hai, pipe se nahi</text>
</svg><p class="cap">Pipe ek command ke stdout ko agle ke stdin se jodta hai; stderr alag hai.</p></div>

<h3>Pehla pipe</h3>
<pre class="out">netadmin@nms01:~$ ls /var/log | wc -l
5
netadmin@nms01:~$ ls /var/log | grep log
auth.log
dpkg.log
kern.log
syslog</pre>
<p><code>ls /var/log</code> normally screen par paanch naam print karta. <code>| wc -l</code> ke saath woh <code>wc</code> ko diye gaye, jo lines ginta hai: paanch. <code>| grep log</code> ke saath woh filter hue. Dekho <code>syslog</code> bhi match hua, kyunki usme "log" letters hain. Pipeline ke commands <b>ek saath chalte hain</b>: doosra tab se kaam karne lagta hai jab pehla kuch bhi produce karta hai.</p>
<p>Bahut se commands file name <i>ya</i> pipe se padhte hain. Yeh do lines same kaam karti hain; doosri chhoti hai aur preferred:</p>
<pre class="out">netadmin@nms01:~$ cat devices.csv | grep Pune
PUN-CORE-R1,10.10.0.1,Pune
netadmin@nms01:~$ grep Pune devices.csv
PUN-CORE-R1,10.10.0.1,Pune</pre>

<h3>Pipeline ko stages mein banao</h3>
<p>Sawaal: <b>"Kis router ke sabse zyada line-protocol drops hue?"</b> Poori pipeline ek saath kabhi type mat karo. Ek stage jodo, chalao, output dekho, tab agla jodo. Har stage par real simulator output yeh raha.</p>
<p><b>Stage 1.</b> Sirf interface up/down messages rakho, phir sirf "down" wale. Idea check karne ke liye ginti karo:</p>
<pre class="out">netadmin@nms01:~$ grep LINEPROTO /var/log/remote/routers.log | grep "state to down" | wc -l
11</pre>
<p>Gyarah drops. (<code>LINEPROTO</code> pehle kyun? Kyunki ek <code>%LINK-3-UPDOWN</code> line mein bhi "state to down" hai par woh alag message type hai. Hume sirf line-protocol events chahiye.)</p>
<p><b>Stage 2.</b> Ginne ki jagah device address nikalo. Har line ka field 4 source IP hai, isliye <code>awk '{print $4}'</code> use print karta hai (awk chapter 7 mein samjhaya hai):</p>
<pre class="out">netadmin@nms01:~$ grep LINEPROTO /var/log/remote/routers.log | grep "state to down" | awk '{print $4}'
10.20.0.1
10.20.0.1
10.10.0.1
10.20.0.1
10.40.3.1
10.20.0.1
10.20.0.1
10.20.0.1
10.40.3.1
10.20.0.1
10.20.0.1</pre>
<p><b>Stage 3.</b> Sort karo taaki barabar addresses saath baithen, phir <code>uniq -c</code> padosiyon ko collapse karke ginta hai (chapter 6):</p>
<pre class="out">netadmin@nms01:~$ ... | awk '{print $4}' | sort | uniq -c
      1 10.10.0.1
      8 10.20.0.1
      2 10.40.3.1</pre>
<p><b>Stage 4.</b> Phir sort karo, numerically aur reverse, taaki sabse bada count upar aaye:</p>
<pre class="out">netadmin@nms01:~$ ... | sort | uniq -c | sort -rn
      8 10.20.0.1
      2 10.40.3.1
      1 10.10.0.1
netadmin@nms01:~$ ... | sort | uniq -c | sort -rn | head -n 1
      8 10.20.0.1</pre>
<p>Jawab hai <b>10.20.0.1, aath baar</b>. <code>sort | uniq -c | sort -rn</code> stage ek pattern hai jo aap baar-baar use karoge: ek "top-N counter". Yeh IP addresses, user names, interface names, error codes par chalta hai: kuch bhi jo har line mein ek baar aata ho.</p>

<h3>Pipes sirf stdout le jaate hain</h3>
<pre class="out">netadmin@nms01:~$ ls /nonexistent | wc -l
ls: cannot access '/nonexistent': No such file or directory
0</pre>
<p>Error message stderr par likha gaya, isliye woh screen par gaya, pipe mein nahi, aur <code>wc</code> ne zero lines ginin. Agar aap errors ko pipe mein chahte to pehle stderr ko redirect karte (agla chapter). Jab doosre command ka input khaali ho, hamesha poochho: kya pehla fail hua?</p>

<h3>Pipe ke aur saathi</h3>
<ul>
<li><code>| head -n 20</code> ya <code>| tail -n 20</code>: lambe result ka sirf top ya end dikhao.</li>
<li><code>| less</code>: lambe result ko page karo (real server par).</li>
<li><code>| tee file</code>: data ko file mein likho <i>aur</i> aage bhi bhejo (agla chapter).</li>
<li><code>| xargs cmd</code>: input lines ko doosre command ke arguments bana do. Jaise <code>grep -l "10.40.9.1" *.cfg | xargs ls -l</code> (reference command; simulator mein nahi chalta).</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Lambi pipeline ek hi baar mein likhna aur na pata hona ki kaunsa stage galat hai. Stage by stage banao aur test karo. (2) <code>sort</code> ke bina <code>uniq</code>: <code>uniq</code> sirf <i>padosi</i> barabar lines collapse karta hai. (3) Aise command mein pipe karna jo stdin nahi padhta, jaise <code>ls</code> ya <code>cp</code>; unke liye <code>xargs</code> use karo. (4) Yeh bhoolna ki khaali result ka matlab ho sakta hai ki pehla command fail hua, yeh nahi ki kuch mila nahi. (5) Aadat se <code>cat file | grep ...</code>: chalta hai par ek process waste karta hai; <code>grep ... file</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pipe <b>stdout</b> ko <b>stdin</b> se jodta hai; stderr nahi le jaata. Aam top-N idiom <code>sort | uniq -c | sort -rn</code> hai, aur pehla <code>sort</code> zaroori hai kyunki <code>uniq</code> sirf adjacent lines par kaam karta hai.</p></div>

<div class="scn"><h4>Tees second mein sabse noisy router</h4><p>Subah 9 baje manager ne poochha, "Aaj subah sabse bura router kaunsa hai?" Engineer ne uske saamne pipeline banayi: pehle <code>grep</code>, phir IP lene ke liye <code>awk</code>, phir counter. Har stage par usne output dikhaya taaki manager follow kar sake. Aakhri line ne kaha <code>8 10.20.0.1</code>. Manager ne host name poochha, aur engineer ne <code>devices.csv</code> mein ek aur lookup joda: BLR-EDGE-R2.</p><p><b>Lesson:</b> pipelines stage by stage banao; aap har step explain kar sakte ho aur shayad hi galti hogi.</p></div>

<div class="iv"><p class="q">"Pipe kya karta hai, aur uniq -c se pehle sort kyun chahiye?"</p><p>Pipe ek command ke standard output ko agle ke standard input se jodta hai, taaki chhote tools combine ho sakein. <code>uniq</code> sirf adjacent identical lines collapse karta hai, isliye input pehle sorted hona chahiye, warna same value counts mein kai baar dikhti hai. Phir <code>sort -rn</code> counts ko rank karta hai, bada pehle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har command ke stdin, stdout aur stderr hote hain; pipe stdout ko agle stdin se jodta hai.</li>
<li>Pipelines stages mein banao aur har ek ke baad output check karo.</li>
<li>Top-N counter hai <code>sort | uniq -c | sort -rn | head</code>.</li>
<li>stderr pipe se nahi guzarta.</li>
<li><code>cat file | grep x</code> se behtar <code>grep x file</code>.</li>
</ul></div>
`}};export{e as default};