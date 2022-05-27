const firstWrapBubble = d3
  .select("#my_dataviz")
  .append("div")
  .attr("class", "firstWrapBubble")
  .attr("id", "firstWrapBubble")

firstWrapBubble
  .append("div")
  .attr("class", "title")
  .attr("id", "bubblestitle")
  .text("Intertopic Distance Map (via multidimensional scaling)")

const svgBubbleWrapper = d3
  .select("#firstWrapBubble")
  .append("div")
  .attr("class", "bubbleWrapper")
  .append("svg")

const firstWrapBars = d3
  .select("#my_dataviz")
  .append("div")
  .attr("class", "firstWrapBars")
  .attr("id", "firstWrapBars")

const titleBar = firstWrapBars
  .append("div")
  .attr("class", "title")
  .attr("id", "barstitle")

const svgBarsWrapper = d3
  .select("#firstWrapBars")
  .append("div")
  .attr("class", "barsWrapper")
  .append("svg")
  .attr("class", "svg-bars")

const UNIQUE_CITIES = [
  "Province Of Vicenza",
  "Antwerp Province",
  "East Flanders",
  "Dalmatia",
  "South Holland Province",
  "Utsjoki",
  "Province Of Huesca",
]

// SELECTION DROPDOWN  //////////////////////////
d3.select("#selectButtonTopics")
  .selectAll("myOptions")
  .data(UNIQUE_CITIES)
  .enter()
  .append("option")
  .text(function (d) {
    return d
  })
  .attr("value", function (d) {
    return d
  })

function redraw(firstRender) {
  const width =
    window.innerHeight > 531 ? window.innerWidth / 2 : window.innerWidth
  const height = window.innerHeight > 531 ? window.innerHeight : 830

  const svgBubbles = svgBubbleWrapper
    .attr("width", width)
    .attr("height", height)

  const svgBars = svgBarsWrapper.attr("width", width).attr("height", height)

  titleBar.text("Top 30 most salient terms")

  const margins = {
    top: 50,
    right: 50,
    left: 50,
    bottom: 50,
  }
  const wordMargin = 50
  const uniqueCities = [...new Set(newData.map((d) => d.city))]

  const colorScale = d3
    .scaleOrdinal()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .range([
      "#B2D329",
      "#FF9900",
      "#61BFE4",
      "#5768FF",
      "#589322",
      "#BA3AE1",
      "#FF5A5A",
      "#F4DC02",
      "#CC8701",
      "#03CE9D",
    ])

  //BUBBLES SCALES
  const xScaleBubble = d3
    .scaleLinear()
    .domain([-0.5, 0.5])
    .range([margins.left, width - margins.right])

  const yScaleBubble = d3
    .scaleLinear()
    .domain([-0.5, 0.5])
    .range([margins.top, height - margins.bottom])

  const circleScale = d3
    .scaleSqrt()
    .domain([0, 100])
    .range([5, height / 6.86])

  // BARS SCALES
  const widthScaleBars = d3
    .scaleLinear()
    .domain([0, 0.25])
    .range([0, width - margins.right])

  //EVENT HANDLERS FUNCTIONS

  const mouseOverBubble = function (event) {
    const hoveredTopic = event.target.__data__.topic
    d3.selectAll("circle.bubbles")
      .transition()
      .duration(450)
      .style("opacity", 0.1)
    d3.select(this).transition().duration(600).style("opacity", 0.75)
    d3.select(this).style("fill", (d) => colorScale(d.topic))
    const selectedCity = document.getElementById("selectButtonTopics").value

    svgBars.selectAll("rects").attr("fill", (d) => colorScale(d.topic))
    const hoveredDataset = newData
      .filter((d) => d.city === selectedCity)
      .filter((d) => d.topic === hoveredTopic)
    titleBar.text("Top 30 most salient terms for Cluster " + hoveredTopic)

    drawBarChart(hoveredDataset, "hovered")
  }

  const mouseOutBubble = function (d) {
    d3.selectAll("circle.bubbles")
      .transition()
      .duration(600)
      .style("opacity", 0.75)
      .style("fill", (d) => colorScale(d.topic))
    //.style("fill", "#E4E4E4")

    const selectedCity = document.getElementById("selectButtonTopics").value
    const defaultSelectedCity = newData
      .filter((d) => d.city === selectedCity)
      .filter((d) => d.default === "y")

    titleBar.text("Top 30 most salient terms")

    drawBarChart(defaultSelectedCity, "default")
  }

  //SVG BUBBLES /////////////////////////////////////////////////////

  function drawBubblePlot(dataset, firstRender) {
    let state = "notClicked"
    const axis = [
      {
        x1: margins.left,
        x2: width - margins.right,
        y1: height / 2,
        y2: height / 2,
      },

      {
        x1: width / 2,
        x2: width / 2,
        y1: margins.top,
        y2: height - margins.bottom,
      },
    ]
    // AXIS AS SVG LINES
    svgBubbles
      .selectAll("line")
      .data(axis)
      .join("line")
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x2)
      .attr("y1", (d) => d.y1)
      .attr("y2", (d) => d.y2)
      .style("stroke", "#BDBDBD")
      .style("opacity", 1)
    //Bubbles
    svgBubbles
      .selectAll("circle")
      .data(dataset)
      .join("circle")
      .attr("class", "bubbles")
      .attr("id", (d) => `circle-${d.topic}`)
      .attr("cx", (d) => xScaleBubble(d.pc1))
      .attr("cy", (d) => yScaleBubble(d.pc2))
      .attr(
        "r",
        firstRender === true ? 2 : (d) => circleScale(d.tokensPercentage)
      )
      .attr("fill", (d) => colorScale(d.topic))
      .style("opacity", 0.75)
      .on("mouseover", mouseOverBubble)
      .on("click", function (d) {
        state === "notClicked" ? (state = "clicked") : null
        if (state === "clicked") {
          d3.selectAll("circle").style("pointer-events", "none")
        }
        console.log(state, "state")
      })
      .on("mouseleave", mouseOutBubble)

    firstRender === true
      ? svgBubbles
          .selectAll("circle")
          .transition()
          .duration(700)
          .attr("r", (d) => circleScale(d.tokensPercentage))
      : null

    const axisLabs = [
      { x: margins.left, y: height / 2 + 14, text: "PC1" },
      { x: width / 2 + 8, y: margins.top + 10, text: "PC2" },
    ]

    svgBubbles
      .selectAll("text")
      .data(axisLabs)
      .join("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .style("fill", "#BDBDBD")
      .style("font-family", "Noto Sans")
      .style("font-size", 11)
      .text((d) => d.text)

    // svgBubbles inner fill
    //   .selectAll("innercircles")
    //   .data(dataset)
    //   .join("circle")
    //   .attr("class", "bubbles-center")

    //   .attr("cx", (d) => xScaleBubble(d.pc1))
    //   .attr("cy", (d) => yScaleBubble(d.pc2))
    //   .attr("r", 5)
    //   .attr("fill", (d) => colorScale(d.topic))
    //   .style("opacity", 1)

    //Bubbles LABELS
    // svgBubbles
    //   .selectAll("text")
    //   .data(dataset)
    //   .join("text")
    //   .attr("id", (d) => d.topic)
    //   .attr("x", (d) => xScaleBubble(d.pc1))
    //   .attr("y", (d) => yScaleBubble(d.pc2) + 4)
    //   .attr("font-family", "Noto Sans")
    //   .style("text-anchor", "middle")
    //   .style("pointer-events", "none")
    //   .style("opacity", 0.6)
    //   .text((d) => d.topic)
  }

  // FIRST RENDER OF BUBBLES WITH STARTING VALUE
  drawBubblePlot(
    bubbleData.filter(
      (d) => d.zone === document.getElementById("selectButtonTopics").value
    ),
    true
  )

  //SVG BARS ///////////////////////////////////////////////////////////////////////////////////////////////

  const mouseOverBar = function (event) {
    const hoveredBar = event.target.__data__
    svgBars.select("#" + hoveredBar.word).style("font-weight", "bold")
    svgBars.selectAll("rect").transition().duration(200).style("opacity", 0.2)
    svgBars
      .select("#rect-" + hoveredBar.word)
      .transition()
      .duration(200)
      .attr("fill", (d) => colorScale(d.topic))
      .style("opacity", 11)
    svgBars.select("#importance-value-" + hoveredBar.word).style("opacity", 1)

    svgBubbles
      .selectAll("circle")
      .transition()
      .duration(450)
      .style("opacity", 0.1)
    svgBubbles
      .select("#circle-" + hoveredBar.topic)
      .transition()
      .duration(200)
      .style("fill", (d) => colorScale(d.topic))
      .style("opacity", 0.75)
    // .style("stroke", "black")
  }

  const mouseOutBar = function (event) {
    const hoveredBarOut = event.target.__data__
    svgBars.select("#" + hoveredBarOut.word).style("font-weight", 400)
    d3.selectAll("circle").transition().duration(450).style("opacity", 0.75)

    const dd = newData
      .filter(
        (d) => d.city === document.getElementById("selectButtonTopics").value
      )
      .filter((d) => d.default === "y")

    drawBarChart(dd, "default")
  }

  const paddingRects = width / 2

  const drawBarChart = function (dataset, state, firstRender) {
    const yScaleBars = d3
      .scaleOrdinal()
      .domain([])
      .range(d3.range(margins.top, height - margins.bottom, height / 36))

    //RECTS
    svgBars
      .selectAll("rect")
      .data(dataset, (d) => d.word)
      .join("rect")
      .attr("id", (d) => "rect-" + d.word)
      .attr("class", "datarects")
      .attr("x", margins.left + wordMargin + 25)
      .attr("y", (d) => yScaleBars(d.word))
      .attr(
        "width",
        firstRender === true ? 0 : (d) => widthScaleBars(d.importance_word)
      )
      .attr("height", height / 68.6)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr(
        "fill",
        state === "default" ? "#CECDCD" : (d) => colorScale(d.topic)
      )

      .style("stroke-width", 1)
      .style("opacity", state === "default" ? 1 : 0)

      .on("mouseover", mouseOverBar)
      .on("mouseout", mouseOutBar)

    if (state === "hovered") {
      svgBars.selectAll("rect").transition().duration(450).style("opacity", 1)
    }
    if (firstRender === true) {
      svgBars
        .selectAll("rect")
        .transition()
        .duration(1000)
        .attr("width", (d) => widthScaleBars(d.importance_word))
    }

    //DOUBLE BARS
    svgBars
      .selectAll("x")
      .data(dataset, (d) => d.word)
      .join("rect")
      .attr("x", margins.left + wordMargin + 10)
      .attr("y", (d) => yScaleBars(d.word))
      .attr("fill", (d) => colorScale(d.topic))
      .attr("width", 8)
      .attr("height", height / 68.6)
      .attr("rx", 3)
      .attr("ry", 3)
      .style("pointer-events", "none")

    // WORDS
    svgBars
      .selectAll("text")
      .data(dataset, (d) => d.word)
      .join("text")
      .attr("id", (d) => d.word)
      .attr("x", margins.left + wordMargin)
      .attr("y", (d) => yScaleBars(d.word) + 10)
      .attr("font-family", "Noto Sans")
      .text((d) => d.word.replace("_", " "))
      .style("text-anchor", "end")
      .style("font-size", (d) => (d.word.length > 13 ? 9 : 12))
      .on("mouseover", function (event) {
        const hoveredWord = event.target.__data__

        d3.select(this).style("font-weight", "800")

        svgBars
          .selectAll("rect")
          .transition()
          .duration(200)
          .style("opacity", 0.2)
        svgBars
          .select("#rect-" + hoveredWord.word)
          .transition()
          .duration(200)
          .style("opacity", 0.75)
          .attr("fill", colorScale(hoveredWord.topic))
        svgBubbles.selectAll("circle").style("opacity", 0.1)
        svgBubbles
          .select("#circle-" + hoveredWord.topic)
          .transition()
          .duration(200)
          .style("opacity", 0.75)
      })
      .on("mouseleave", function (event) {
        d3.select(this).style("font-weight", "400")
        const hoveredWord = event.target.__data__

        svgBars
          .selectAll("rect")
          .transition()
          .duration(200)
          .style("opacity", 0.75)

        svgBars
          .select("#rect-" + hoveredWord.word)
          .transition()
          .duration(200)
          .style("opacity", 0.75)
          .attr("fill", "#CECDCD")
      })
    ////IMPORTANCE WORD VALUE
    svgBars
      .selectAll()
      .data(dataset, (d) => d.importance_word)
      .join("text")
      .attr("id", (d) => "importance-value-" + d.word)
      .attr(
        "x",
        (d) =>
          margins.left + wordMargin + widthScaleBars(d.importance_word) + 28
      )
      .attr("y", (d) => yScaleBars(d.word) + 10)
      .attr("font-family", "Noto Sans")
      .text((d) => d.importance_word)
      .style("text-anchor", "start")
      .style("font-size", 12)
      .style("opacity", 0)
  }

  let currentClusterButton = 0
  d3.select("#nextCluster").on("click", function (d) {
    clusters = d3.range(0, 10)
    currentClusterButton = (currentClusterButton + 1) % 10

    d3.select(".currentCluster").text("Cluster " + currentClusterButton)

    const colorScale = d3
      .scaleOrdinal()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .range([
        "#B2D329",
        "#FF9900",
        "#61BFE4",
        "#5768FF",
        "#589322",
        "#BA3AE1",
        "#FF5A5A",
        "#F4DC02",
        "#CC8701",
        "#03CE9D",
      ])

    // const hoveredTopic = event.target.__data__.topic

    d3.selectAll("circle.bubbles")
      .transition()
      .duration(450)
      .style("opacity", 0.1)
    d3.select("#circle-" + currentClusterButton)
      .transition()
      .duration(600)
      .style("opacity", 0.75)
    d3.select("#circle-" + currentClusterButton).style("fill", (d) =>
      colorScale(d.topic)
    )
    const selectedCity = document.getElementById("selectButtonTopics").value

    d3.select(".svg-bars")
      .selectAll("rects")
      .attr("fill", (d) => colorScale(d.topic))
    const hoveredDataset = newData
      .filter((d) => d.city === selectedCity)
      .filter((d) => d.topic === currentClusterButton)
    titleBar.text(
      "Top 30 most salient terms for Cluster " + currentClusterButton
    )

    drawBarChart(hoveredDataset, "hovered")
  })

  d3.select("#prevCluster").on("click", function (d) {
    d3.select(".currentCluster").text("Cluster " + currentClusterButton)

    console.log(currentClusterButton)
    clusters = d3.range(0, 10)
    currentClusterButton = (-1 * (currentClusterButton - 1)) % 10

    const colorScale = d3
      .scaleOrdinal()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .range([
        "#B2D329",
        "#FF9900",
        "#61BFE4",
        "#5768FF",
        "#589322",
        "#BA3AE1",
        "#FF5A5A",
        "#F4DC02",
        "#CC8701",
        "#03CE9D",
      ])

    // const hoveredTopic = event.target.__data__.topic

    d3.selectAll("circle.bubbles")
      .transition()
      .duration(450)
      .style("opacity", 0.1)
    d3.select("#circle-" + currentClusterButton)
      .transition()
      .duration(600)
      .style("opacity", 0.75)
    d3.select("#circle-" + currentClusterButton).style("fill", (d) =>
      colorScale(d.topic)
    )
    const selectedCity = document.getElementById("selectButtonTopics").value

    d3.select(".svg-bars")
      .selectAll("rects")
      .attr("fill", (d) => colorScale(d.topic))
    const hoveredDataset = newData
      .filter((d) => d.city === selectedCity)
      .filter((d) => d.topic === currentClusterButton)
    titleBar.text(
      "Top 30 most salient terms for Cluster " + currentClusterButton
    )

    drawBarChart(hoveredDataset, "hovered")
  })

  d3.select("#selectButtonTopics").on("change", function (d) {
    const selectedOption = d3.select(this).property("value")
    drawBarChart(
      newData
        .filter((d) => d.city === selectedOption)
        .filter((d) => d.default === "y"),
      "default",
      true
    )
    drawBubblePlot(
      bubbleData.filter((d) => d.zone === selectedOption),
      true
    )
  })
  const selectedCity = document.getElementById("selectButtonTopics").value

  drawBarChart(
    newData
      .filter((d) => d.city === selectedCity)
      .filter((d) => d.default === "y"),
    "default",
    true
  )
}

redraw(true)
window.addEventListener("resize", redraw)
